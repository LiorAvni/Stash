"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { admin } from "@/lib/supabase/admin";
import { isAuthenticated } from "@/lib/session";
import { createUploadUrl, deleteObject } from "@/lib/storage";
import { env } from "@/lib/env";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

// ---------- Folders ----------
const FolderInput = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().max(40).default("folder"),
  color: z.string().trim().max(20).default("indigo"),
});

export async function createFolder(formData: FormData) {
  await requireAuth();
  const parsed = FolderInput.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || "folder",
    color: formData.get("color") || "indigo",
  });
  const { error } = await admin().from("folders").insert(parsed);
  if (error) throw error;
  revalidatePath("/");
}

export async function renameFolder(id: string, name: string) {
  await requireAuth();
  const v = z.string().trim().min(1).max(80).parse(name);
  const { error } = await admin().from("folders").update({ name: v }).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath(`/f/${id}`);
}

export async function updateFolder(
  id: string,
  patch: { name?: string; icon?: string; color?: string; pinned?: boolean },
) {
  await requireAuth();
  const { error } = await admin().from("folders").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath(`/f/${id}`);
}

export async function deleteFolder(id: string) {
  await requireAuth();
  // Items keep existing (folder_id becomes null because of ON DELETE SET NULL)
  const { error } = await admin().from("folders").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  redirect("/");
}

// ---------- Items ----------
const NoteInput = z.object({
  folder_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(200).optional().nullable(),
  body: z.string().max(50_000).optional().nullable(),
});

export async function createNote(input: {
  folder_id: string | null;
  title?: string | null;
  body?: string | null;
}) {
  await requireAuth();
  const v = NoteInput.parse(input);
  if (!v.title && !v.body) throw new Error("Empty note");
  const { data, error } = await admin()
    .from("items")
    .insert({
      folder_id: v.folder_id ?? null,
      type: "note",
      title: v.title || null,
      body: v.body || null,
    })
    .select("id, folder_id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  if (data.folder_id) revalidatePath(`/f/${data.folder_id}`);
  return { id: data.id as string };
}

const LinkInput = z.object({
  folder_id: z.string().uuid().nullable().optional(),
  url: z.string().url().max(2000),
  title: z.string().trim().max(200).optional().nullable(),
});

export async function createLink(input: {
  folder_id: string | null;
  url: string;
  title?: string | null;
}) {
  await requireAuth();
  const v = LinkInput.parse(input);
  let title = v.title?.trim() || null;
  if (!title) {
    title = await fetchPageTitle(v.url).catch(() => null);
  }
  const { data, error } = await admin()
    .from("items")
    .insert({
      folder_id: v.folder_id ?? null,
      type: "link",
      title: title || v.url,
      url: v.url,
    })
    .select("id, folder_id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  if (data.folder_id) revalidatePath(`/f/${data.folder_id}`);
  return { id: data.id as string };
}

export async function requestUploadUrl(input: {
  folder_id: string | null;
  filename: string;
  mime: string;
  size: number;
  kind: "image" | "file";
}) {
  await requireAuth();
  const safeName = input.filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const ts = Date.now();
  const path = `${input.kind}s/${ts}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { uploadUrl, token } = await createUploadUrl({ path });
  return { uploadUrl, token, path };
}

export async function finalizeUpload(input: {
  folder_id: string | null;
  storage_path: string;
  filename: string;
  mime: string;
  size: number;
  kind: "image" | "file";
}) {
  await requireAuth();
  const { data, error } = await admin()
    .from("items")
    .insert({
      folder_id: input.folder_id ?? null,
      type: input.kind,
      title: input.filename,
      storage_path: input.storage_path,
      mime_type: input.mime,
      size_bytes: input.size,
    })
    .select("id, folder_id")
    .single();
  if (error) {
    // Clean up orphaned object on failure.
    await deleteObject(input.storage_path).catch(() => {});
    throw error;
  }
  revalidatePath("/");
  if (data.folder_id) revalidatePath(`/f/${data.folder_id}`);
  return { id: data.id as string };
}

export async function updateItem(
  id: string,
  patch: {
    title?: string | null;
    body?: string | null;
    folder_id?: string | null;
    pinned?: boolean;
    favorite?: boolean;
  },
) {
  await requireAuth();
  const { data, error } = await admin()
    .from("items")
    .update(patch)
    .eq("id", id)
    .select("folder_id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath(`/i/${id}`);
  if (data?.folder_id) revalidatePath(`/f/${data.folder_id}`);
}

export async function softDeleteItem(id: string) {
  await requireAuth();
  const { data, error } = await admin()
    .from("items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("folder_id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/trash");
  if (data?.folder_id) revalidatePath(`/f/${data.folder_id}`);
}

export async function restoreItem(id: string) {
  await requireAuth();
  const { data, error } = await admin()
    .from("items")
    .update({ deleted_at: null })
    .eq("id", id)
    .select("folder_id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/trash");
  if (data?.folder_id) revalidatePath(`/f/${data.folder_id}`);
}

export async function purgeItem(id: string) {
  await requireAuth();
  const { data: item } = await admin()
    .from("items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (item?.storage_path) await deleteObject(item.storage_path).catch(() => {});
  const { error } = await admin().from("items").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/trash");
}

async function fetchPageTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 StashBot/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return m ? m[1].trim().slice(0, 200) : null;
  } catch {
    return null;
  }
}

// Reference env so the typecheck doesn't drop the import on tree-shake.
export async function _envCheck() {
  return { bucket: env.supabaseBucket };
}

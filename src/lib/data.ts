import "server-only";
import { admin } from "@/lib/supabase/admin";
import type { Folder, Item } from "@/lib/types";

const db = () => admin();

// ---------- Folders ----------
export async function listFolders(): Promise<Folder[]> {
  const { data, error } = await db()
    .from("folders")
    .select("*")
    .order("pinned", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Folder[];
}

export async function getFolder(id: string): Promise<Folder | null> {
  const { data, error } = await db().from("folders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Folder) ?? null;
}

export async function folderItemCounts(): Promise<Record<string, number>> {
  const { data, error } = await db()
    .from("items")
    .select("folder_id")
    .is("deleted_at", null);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as { folder_id: string | null }).folder_id;
    if (!id) continue;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

// ---------- Items ----------
export async function listItemsInFolder(folderId: string): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .eq("folder_id", folderId)
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function getItem(id: string): Promise<Item | null> {
  const { data, error } = await db().from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Item) ?? null;
}

export async function listRecent(limit = 10): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function listPinnedItems(): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .eq("pinned", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function listFavorites(): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .eq("favorite", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function listTrash(): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function searchItems(query: string): Promise<Item[]> {
  const q = query.trim();
  if (!q) return [];
  // Use Postgres FTS via tsvector column. Build an OR of prefix-matched lexemes.
  const tsQuery = q
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}_]/gu, ""))
    .filter(Boolean)
    .map((t) => `${t}:*`)
    .join(" & ");
  if (!tsQuery) return [];
  const { data, error } = await db()
    .from("items")
    .select("*")
    .is("deleted_at", null)
    .textSearch("search", tsQuery, { config: "simple" })
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw error;
  return (data ?? []) as Item[];
}

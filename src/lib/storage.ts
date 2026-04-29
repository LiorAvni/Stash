import { admin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

// Storage abstraction. Today: Supabase Storage.
// Swap to Cloudflare R2 later by replacing the implementations below;
// the rest of the app uses these functions only.

export async function createUploadUrl(opts: { path: string }): Promise<{
  uploadUrl: string;
  token: string;
  path: string;
}> {
  const { data, error } = await admin()
    .storage.from(env.supabaseBucket)
    .createSignedUploadUrl(opts.path);
  if (error || !data) throw error ?? new Error("Failed to create upload URL");
  return { uploadUrl: data.signedUrl, token: data.token, path: data.path };
}

export async function createDownloadUrl(
  path: string,
  expiresInSeconds = 60 * 60,
): Promise<string> {
  const { data, error } = await admin()
    .storage.from(env.supabaseBucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) throw error ?? new Error("Failed to create download URL");
  return data.signedUrl;
}

export async function deleteObject(path: string): Promise<void> {
  if (!path) return;
  await admin().storage.from(env.supabaseBucket).remove([path]);
}

export function publicBucket(): string {
  return env.supabaseBucket;
}

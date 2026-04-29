import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { admin } from "@/lib/supabase/admin";
import { createDownloadUrl } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { data, error } = await admin()
    .from("items")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (error || !data?.storage_path) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const url = await createDownloadUrl(data.storage_path, 60 * 60);
  return NextResponse.redirect(url, { status: 302 });
}

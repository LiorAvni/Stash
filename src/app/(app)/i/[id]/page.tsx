import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, ExternalLink } from "lucide-react";
import { getItem, listFolders } from "@/lib/data";
import { ItemActions } from "./item-actions";
import { formatBytes, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, folders] = await Promise.all([getItem(id), listFolders()]);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-4 pt-2">
      <header className="flex items-center justify-between">
        <Link
          href={item.folder_id ? `/f/${item.folder_id}` : "/"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <ItemActions item={item} folders={folders} />
      </header>

      {item.type === "image" && item.storage_path ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/file/${item.id}`}
          alt={item.title || ""}
          className="w-full rounded-2xl border border-[var(--color-border)] object-contain"
        />
      ) : null}

      {item.type === "file" && item.storage_path ? (
        <a
          href={`/api/file/${item.id}`}
          className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{item.title}</div>
            <div className="text-xs text-[var(--color-muted-fg)]">
              {item.mime_type || "file"}
              {item.size_bytes ? ` · ${formatBytes(item.size_bytes)}` : ""}
            </div>
          </div>
          <Download className="h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" />
        </a>
      ) : null}

      {item.type === "link" && item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
        >
          <div className="min-w-0">
            <div className="truncate font-medium">{item.title || item.url}</div>
            <div className="truncate text-xs text-[var(--color-muted-fg)]">
              {item.url}
            </div>
          </div>
          <ExternalLink className="h-5 w-5 shrink-0 text-[var(--color-muted-fg)]" />
        </a>
      ) : null}

      {item.title && item.type !== "link" ? (
        <h1 className="text-2xl font-semibold leading-tight">{item.title}</h1>
      ) : null}
      {item.body ? (
        <div className="whitespace-pre-wrap rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-[15px] leading-relaxed">
          {item.body}
        </div>
      ) : null}

      <div className="text-xs text-[var(--color-muted-fg)]">
        Created {formatRelative(item.created_at)}
        {item.updated_at !== item.created_at
          ? ` · updated ${formatRelative(item.updated_at)}`
          : ""}
      </div>
    </div>
  );
}

import Link from "next/link";
import { FileText, Image as ImageIcon, Link as LinkIcon, Paperclip, Pin, Star } from "lucide-react";
import type { Item } from "@/lib/types";
import { formatBytes, formatRelative } from "@/lib/utils";

function ItemIcon({ type, className }: { type: Item["type"]; className?: string }) {
  switch (type) {
    case "note":  return <FileText  className={className} />;
    case "image": return <ImageIcon className={className} />;
    case "link":  return <LinkIcon  className={className} />;
    case "file":  return <Paperclip className={className} />;
  }
}

export function ItemRow({ item }: { item: Item }) {
  const subtitle =
    item.type === "note"
      ? (item.body || "").slice(0, 120)
      : item.type === "link"
        ? item.url
        : item.size_bytes
          ? formatBytes(item.size_bytes)
          : item.mime_type || "";

  return (
    <Link
      href={`/i/${item.id}`}
      className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-fg)]">
        {item.type === "image" && item.storage_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/file/${item.id}`}
            alt=""
            className="h-12 w-12 rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <ItemIcon type={item.type} className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="truncate text-[15px] font-medium">
            {item.title || "(untitled)"}
          </div>
          {item.pinned ? <Pin className="h-3.5 w-3.5 text-[var(--color-accent)]" /> : null}
          {item.favorite ? (
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ) : null}
        </div>
        {subtitle ? (
          <div className="mt-0.5 line-clamp-2 text-sm text-[var(--color-muted-fg)]">
            {subtitle}
          </div>
        ) : null}
        <div className="mt-1 text-xs text-[var(--color-muted-fg)]">
          {formatRelative(item.created_at)}
        </div>
      </div>
    </Link>
  );
}

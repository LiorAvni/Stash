"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import type { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { purgeItem, restoreItem } from "../actions";
import { formatRelative } from "@/lib/utils";

export function TrashList({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div
          key={it.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"
        >
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium">
              {it.title || "(untitled)"}
            </div>
            <div className="text-xs text-[var(--color-muted-fg)]">
              Deleted {it.deleted_at ? formatRelative(it.deleted_at) : ""}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  try {
                    await restoreItem(it.id);
                    toast.success("Restored");
                    router.refresh();
                  } catch (err) { toast.error((err as Error).message); }
                })
              }
            >
              <RotateCcw className="h-4 w-4" /> Restore
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!confirm("Permanently delete?")) return;
                start(async () => {
                  try {
                    await purgeItem(it.id);
                    toast.success("Deleted");
                    router.refresh();
                  } catch (err) { toast.error((err as Error).message); }
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

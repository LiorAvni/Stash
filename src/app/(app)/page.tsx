import Link from "next/link";
import { FolderPlus } from "lucide-react";
import {
  folderItemCounts,
  listFolders,
  listPinnedItems,
  listRecent,
} from "@/lib/data";
import { FolderCard } from "@/components/folder-card";
import { ItemRow } from "@/components/item-card";
import { Composer } from "@/components/composer";
import { NewFolderButton } from "./new-folder-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [folders, counts, pinned, recent] = await Promise.all([
    listFolders(),
    folderItemCounts(),
    listPinnedItems(),
    listRecent(8),
  ]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME || "Stash"}
        </h1>
        <NewFolderButton />
      </header>

      {pinned.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
            Pinned
          </h2>
          <div className="flex flex-col gap-2">
            {pinned.map((it) => <ItemRow key={it.id} item={it} />)}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
          Folders
        </h2>
        {folders.length === 0 ? (
          <EmptyFolders />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {folders.map((f) => (
              <FolderCard key={f.id} folder={f} count={counts[f.id] ?? 0} />
            ))}
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
            Recent
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((it) => <ItemRow key={it.id} item={it} />)}
          </div>
        </section>
      )}

      <Composer folders={folders} />
    </div>
  );
}

function EmptyFolders() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-muted)] text-[var(--color-muted-fg)]">
        <FolderPlus className="h-6 w-6" />
      </div>
      <p className="text-sm text-[var(--color-muted-fg)]">
        No folders yet. Create your first one above.
      </p>
      <Link
        href="#"
        className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        Tip: tap the + button to capture a quick note.
      </Link>
    </div>
  );
}

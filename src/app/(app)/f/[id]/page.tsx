import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getFolder, listFolders, listItemsInFolder } from "@/lib/data";
import { ItemRow } from "@/components/item-card";
import { Composer } from "@/components/composer";
import { FolderMenu } from "./folder-menu";

export const dynamic = "force-dynamic";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [folder, items, folders] = await Promise.all([
    getFolder(id),
    listItemsInFolder(id),
    listFolders(),
  ]);
  if (!folder) notFound();

  return (
    <div className="flex flex-col gap-4 pt-2">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="truncate px-3 text-lg font-semibold">{folder.name}</h1>
        <FolderMenu folder={folder} />
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted-fg)]">
          Nothing here yet. Tap + to add.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((it) => <ItemRow key={it.id} item={it} />)}
        </div>
      )}

      <Composer folders={folders} defaultFolderId={folder.id} />
    </div>
  );
}

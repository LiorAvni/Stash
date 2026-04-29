import { listTrash } from "@/lib/data";
import { TrashList } from "./trash-list";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const items = await listTrash();
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted-fg)]">
          Trash is empty.
        </p>
      ) : (
        <TrashList items={items} />
      )}
    </div>
  );
}

import { listFavorites } from "@/lib/data";
import { ItemRow } from "@/components/item-card";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const items = await listFavorites();
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted-fg)]">
          Star items to see them here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((it) => <ItemRow key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}

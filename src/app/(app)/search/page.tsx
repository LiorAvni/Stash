import { Search as SearchIcon } from "lucide-react";
import { searchItems } from "@/lib/data";
import { ItemRow } from "@/components/item-card";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchItems(q) : [];

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <form action="/search" method="get" className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-muted-fg)]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search notes, files, links..."
          autoFocus
          className="h-12 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] pl-12 pr-4 text-base outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </form>

      {q.trim() === "" ? (
        <p className="text-sm text-[var(--color-muted-fg)]">
          Type to search across all your stuff.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-fg)]">
          No results for &quot;{q}&quot;.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((it) => <ItemRow key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}

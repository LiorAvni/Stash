import Link from "next/link";
import {
  Folder as FolderIcon,
  Inbox,
  Lightbulb,
  Book,
  Calendar,
  Star,
  Briefcase,
  Heart,
  Plane,
  Music,
  Camera,
  ShoppingBag,
} from "lucide-react";
import type { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: FolderIcon,
  inbox: Inbox,
  lightbulb: Lightbulb,
  book: Book,
  calendar: Calendar,
  star: Star,
  briefcase: Briefcase,
  heart: Heart,
  plane: Plane,
  music: Music,
  camera: Camera,
  bag: ShoppingBag,
};

const COLORS: Record<string, string> = {
  slate:   "from-slate-500 to-slate-700",
  indigo:  "from-indigo-500 to-violet-600",
  amber:   "from-amber-400 to-orange-500",
  blue:    "from-sky-500 to-blue-600",
  emerald: "from-emerald-500 to-teal-600",
  rose:    "from-rose-500 to-pink-600",
  purple:  "from-fuchsia-500 to-purple-600",
  red:     "from-red-500 to-rose-600",
};

export function folderColorClass(color: string): string {
  return COLORS[color] ?? COLORS.indigo;
}

export function FolderIconFor({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FolderIcon;
  return <Icon className={className} />;
}

export function FolderCard({
  folder,
  count,
}: {
  folder: Folder;
  count: number;
}) {
  return (
    <Link
      href={`/f/${folder.id}`}
      className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition active:scale-[0.98]"
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
          folderColorClass(folder.color),
        )}
      >
        <FolderIconFor name={folder.icon} className="h-6 w-6" />
      </div>
      <div>
        <div className="line-clamp-2 text-base font-semibold leading-tight">
          {folder.name}
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-muted-fg)]">
          {count} {count === 1 ? "item" : "items"}
        </div>
      </div>
      {folder.pinned ? (
        <Star className="absolute right-3 top-3 h-4 w-4 fill-amber-400 text-amber-400" />
      ) : null}
    </Link>
  );
}

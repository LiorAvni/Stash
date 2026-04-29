"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFolder } from "./actions";
import { cn } from "@/lib/utils";

const COLORS = ["indigo", "slate", "amber", "blue", "emerald", "rose", "purple", "red"];
const ICONS = ["folder", "inbox", "lightbulb", "book", "calendar", "star", "briefcase", "heart", "plane", "music", "camera", "bag"];

export function NewFolderButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [color, setColor] = useState("indigo");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-fg)] active:scale-95"
          aria-label="New folder"
        >
          <FolderPlus className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent title="New folder">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("Name is required.");
              return;
            }
            const fd = new FormData();
            fd.set("name", name.trim());
            fd.set("icon", icon);
            fd.set("color", color);
            start(async () => {
              try {
                await createFolder(fd);
                toast.success("Folder created");
                setOpen(false);
                setName("");
                router.refresh();
              } catch (err) {
                toast.error((err as Error).message);
              }
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
              Color
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-9 w-9 rounded-full bg-gradient-to-br ring-offset-2 ring-offset-[var(--color-bg)] transition",
                    swatchClass(c),
                    color === c ? "ring-2 ring-[var(--color-accent)]" : "",
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted-fg)]">
              Icon
            </div>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs",
                    icon === i
                      ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-muted-fg)]",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function swatchClass(c: string) {
  switch (c) {
    case "slate":   return "from-slate-500 to-slate-700";
    case "indigo":  return "from-indigo-500 to-violet-600";
    case "amber":   return "from-amber-400 to-orange-500";
    case "blue":    return "from-sky-500 to-blue-600";
    case "emerald": return "from-emerald-500 to-teal-600";
    case "rose":    return "from-rose-500 to-pink-600";
    case "purple":  return "from-fuchsia-500 to-purple-600";
    case "red":     return "from-red-500 to-rose-600";
    default:        return "from-indigo-500 to-violet-600";
  }
}

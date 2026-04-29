"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Pencil, Pin, Star, Trash2, FolderInput } from "lucide-react";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/dropdown";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { softDeleteItem, updateItem } from "../../actions";
import type { Item, Folder } from "@/lib/types";

export function ItemActions({ item, folders }: { item: Item; folders: Folder[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();

  const togglePin = () =>
    start(async () => {
      try {
        await updateItem(item.id, { pinned: !item.pinned });
        toast.success(item.pinned ? "Unpinned" : "Pinned");
        router.refresh();
      } catch (err) { toast.error((err as Error).message); }
    });

  const toggleFav = () =>
    start(async () => {
      try {
        await updateItem(item.id, { favorite: !item.favorite });
        toast.success(item.favorite ? "Removed from favorites" : "Favorited");
        router.refresh();
      } catch (err) { toast.error((err as Error).message); }
    });

  const remove = () => {
    if (!confirm("Move to Trash?")) return;
    start(async () => {
      try {
        await softDeleteItem(item.id);
        toast.success("Moved to Trash");
        router.push(item.folder_id ? `/f/${item.folder_id}` : "/");
      } catch (err) { toast.error((err as Error).message); }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFav}
          aria-label="Favorite"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] active:scale-95"
        >
          <Star className={item.favorite ? "h-5 w-5 fill-amber-400 text-amber-400" : "h-5 w-5"} />
        </button>
        <Menu>
          <MenuTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] active:scale-95"
              aria-label="More"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </MenuTrigger>
          <MenuContent>
            {(item.type === "note" || item.type === "link") && (
              <MenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" /> Edit
              </MenuItem>
            )}
            <MenuItem onSelect={togglePin}>
              <Pin className="h-4 w-4" /> {item.pinned ? "Unpin" : "Pin"}
            </MenuItem>
            <MenuItem onSelect={() => setMoveOpen(true)}>
              <FolderInput className="h-4 w-4" /> Move to folder
            </MenuItem>
            <MenuItem variant="danger" onSelect={remove}>
              <Trash2 className="h-4 w-4" /> Delete
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent title="Edit">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                try {
                  await updateItem(item.id, {
                    title: title.trim() || null,
                    body: body.trim() || null,
                  });
                  toast.success("Saved");
                  setEditOpen(false);
                  router.refresh();
                } catch (err) { toast.error((err as Error).message); }
              });
            }}
            className="flex flex-col gap-3"
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            {item.type === "note" && (
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
            )}
            <Button type="submit" size="lg" disabled={pending}>Save</Button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={moveOpen} onOpenChange={setMoveOpen}>
        <SheetContent title="Move to folder">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => move(null)}
              className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-left active:scale-[0.99]"
            >
              No folder
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => move(f.id)}
                className="rounded-xl border border-[var(--color-border)] px-4 py-3 text-left active:scale-[0.99]"
              >
                {f.name}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );

  function move(folderId: string | null) {
    start(async () => {
      try {
        await updateItem(item.id, { folder_id: folderId });
        toast.success("Moved");
        setMoveOpen(false);
        router.refresh();
      } catch (err) { toast.error((err as Error).message); }
    });
  }
}

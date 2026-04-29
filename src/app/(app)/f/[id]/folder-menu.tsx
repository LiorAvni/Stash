"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreVertical, Pencil, Pin, Trash2 } from "lucide-react";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "@/components/ui/dropdown";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteFolder, updateFolder } from "../../actions";
import type { Folder } from "@/lib/types";

export function FolderMenu({ folder }: { folder: Folder }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(folder.name);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <>
      <Menu>
        <MenuTrigger asChild>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-muted)] active:scale-95"
            aria-label="Folder options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil className="h-4 w-4" /> Rename
          </MenuItem>
          <MenuItem
            onSelect={() => {
              start(async () => {
                try {
                  await updateFolder(folder.id, { pinned: !folder.pinned });
                  toast.success(folder.pinned ? "Unpinned" : "Pinned");
                  router.refresh();
                } catch (err) {
                  toast.error((err as Error).message);
                }
              });
            }}
          >
            <Pin className="h-4 w-4" /> {folder.pinned ? "Unpin" : "Pin"}
          </MenuItem>
          <MenuItem
            variant="danger"
            onSelect={() => {
              if (!confirm(`Delete "${folder.name}"? Items will move to "No folder".`)) return;
              start(async () => {
                try {
                  await deleteFolder(folder.id);
                  toast.success("Folder deleted");
                } catch (err) {
                  toast.error((err as Error).message);
                }
              });
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </MenuItem>
        </MenuContent>
      </Menu>

      <Sheet open={renameOpen} onOpenChange={setRenameOpen}>
        <SheetContent title="Rename folder">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              start(async () => {
                try {
                  await updateFolder(folder.id, { name: name.trim() });
                  toast.success("Renamed");
                  setRenameOpen(false);
                  router.refresh();
                } catch (err) {
                  toast.error((err as Error).message);
                }
              });
            }}
            className="flex flex-col gap-3"
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Button type="submit" size="lg" disabled={pending}>
              Save
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

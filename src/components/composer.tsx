"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { FileText, Image as ImageIcon, Link as LinkIcon, Paperclip, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createNote,
  createLink,
  finalizeUpload,
  requestUploadUrl,
} from "@/app/(app)/actions";
import type { Folder } from "@/lib/types";

type Tab = "note" | "image" | "file" | "link";

export function Composer({
  folders,
  defaultFolderId,
  className,
}: {
  folders: Folder[];
  defaultFolderId?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("note");
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "fixed bottom-[calc(env(safe-area-inset-bottom)+5rem)] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] shadow-lg shadow-black/20 transition active:scale-95",
            className,
          )}
          aria-label="Add"
        >
          <Plus className="h-6 w-6" strokeWidth={2.6} />
        </button>
      </SheetTrigger>
      <SheetContent title="Add to Stash">
        <Tabs tab={tab} setTab={setTab} />
        <div className="mt-4">
          {tab === "note" && (
            <NoteForm
              folders={folders}
              defaultFolderId={defaultFolderId ?? null}
              onDone={() => setOpen(false)}
            />
          )}
          {tab === "image" && (
            <UploadForm
              kind="image"
              accept="image/*"
              folders={folders}
              defaultFolderId={defaultFolderId ?? null}
              onDone={() => setOpen(false)}
            />
          )}
          {tab === "file" && (
            <UploadForm
              kind="file"
              accept="*/*"
              folders={folders}
              defaultFolderId={defaultFolderId ?? null}
              onDone={() => setOpen(false)}
            />
          )}
          {tab === "link" && (
            <LinkForm
              folders={folders}
              defaultFolderId={defaultFolderId ?? null}
              onDone={() => setOpen(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "note",  label: "Note",  icon: FileText  },
    { id: "image", label: "Photo", icon: ImageIcon },
    { id: "file",  label: "File",  icon: Paperclip },
    { id: "link",  label: "Link",  icon: LinkIcon  },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-xs font-medium transition",
            tab === id
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-muted-fg)]",
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function FolderSelect({
  folders,
  value,
  onChange,
}: {
  folders: Folder[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-base"
    >
      <option value="">No folder</option>
      {folders.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}

function NoteForm({
  folders,
  defaultFolderId,
  onDone,
}: {
  folders: Folder[];
  defaultFolderId: string | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() && !body.trim()) {
          toast.error("Write something first.");
          return;
        }
        start(async () => {
          try {
            await createNote({
              folder_id: folderId,
              title: title.trim() || null,
              body: body.trim() || null,
            });
            toast.success("Saved");
            onDone();
            router.refresh();
          } catch (err) {
            toast.error((err as Error).message);
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Textarea
        placeholder="Write your note..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={8}
      />
      <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

function LinkForm({
  folders,
  defaultFolderId,
  onDone,
}: {
  folders: Folder[];
  defaultFolderId: string | null;
  onDone: () => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (!/^https?:\/\//i.test(trimmed)) {
          toast.error("Enter a full URL starting with http(s)://");
          return;
        }
        start(async () => {
          try {
            await createLink({
              folder_id: folderId,
              url: trimmed,
              title: title.trim() || null,
            });
            toast.success("Saved");
            onDone();
            router.refresh();
          } catch (err) {
            toast.error((err as Error).message);
          }
        });
      }}
      className="flex flex-col gap-3"
    >
      <Input
        type="url"
        inputMode="url"
        placeholder="https://..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        autoFocus
      />
      <Input
        placeholder="Title (optional, auto-fetched if empty)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

function UploadForm({
  kind,
  accept,
  folders,
  defaultFolderId,
  onDone,
}: {
  kind: "image" | "file";
  accept: string;
  folders: Folder[];
  defaultFolderId: string | null;
  onDone: () => void;
}) {
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  async function uploadAll() {
    if (files.length === 0) {
      toast.error(`Choose ${kind === "image" ? "a photo" : "a file"}.`);
      return;
    }
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const original = files[i];
        let toSend: File | Blob = original;
        let mime = original.type;
        const name = original.name;

        if (kind === "image" && original.type.startsWith("image/")) {
          const compressed = await imageCompression(original, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1800,
            useWebWorker: true,
          });
          toSend = compressed;
          mime = compressed.type || mime;
        }

        const { uploadUrl, token, ...rest } = await requestUploadUrl({
          folder_id: folderId,
          filename: name,
          mime,
          size: (toSend as Blob).size,
          kind,
        });
        void token;

        const put = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "content-type": mime || "application/octet-stream" },
          body: toSend,
        });
        if (!put.ok) {
          const txt = await put.text().catch(() => "");
          throw new Error(`Upload failed: ${put.status} ${txt}`);
        }

        await finalizeUpload({
          folder_id: folderId,
          storage_path: rest.path,
          filename: name,
          mime,
          size: (toSend as Blob).size,
          kind,
        });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      toast.success("Uploaded");
      onDone();
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
      setFiles([]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={kind === "image"}
        capture={kind === "image" ? "environment" : undefined}
        className="hidden"
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={() => inputRef.current?.click()}
      >
        {kind === "image" ? "Choose photos" : "Choose file"}
      </Button>
      {files.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm text-[var(--color-muted-fg)]">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--color-muted)] px-3 py-2">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="rounded p-1 hover:bg-[var(--color-border)]"
                aria-label="remove"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
      <Button type="button" size="lg" onClick={uploadAll} disabled={busy || files.length === 0}>
        {busy ? `Uploading ${progress}%` : "Upload"}
      </Button>
      <SheetClose asChild>
        <Button type="button" variant="ghost" size="md">Cancel</Button>
      </SheetClose>
    </div>
  );
}

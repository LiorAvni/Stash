export type ItemType = "note" | "image" | "file" | "link";

export type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string;
  color: string;
  pinned: boolean;
  sort_order: number;
  created_at: string;
};

export type Item = {
  id: string;
  folder_id: string | null;
  type: ItemType;
  title: string | null;
  body: string | null;
  url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  pinned: boolean;
  favorite: boolean;
  due_at: string | null;
  reminder_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

import { invoke } from "@tauri-apps/api/core";
import type { Note } from "../types/note";
import type { Tag } from "../types/tag";

export const noteApi = {
  create: (title: string): Promise<Note> => invoke("create_note", { title }),
  update: (id: string, updates: { title?: string; content?: string; isPinned?: boolean; isArchived?: boolean; isFavorite?: boolean }): Promise<Note> =>
    invoke("update_note", { id, ...updates }),
  delete: (id: string): Promise<void> => invoke("delete_note", { id }),
  get: (id: string): Promise<Note | null> => invoke("get_note", { id }),
  list: (workspaceId?: string, offset?: number, limit?: number): Promise<Note[]> =>
    invoke("list_notes", { workspaceId, offset, limit }),
  search: (keyword: string, limit?: number): Promise<Note[]> =>
    invoke("search_notes", { keyword, limit }),
  getTags: (noteId: string): Promise<Tag[]> =>
    invoke("get_note_tags", { noteId }),
  setTags: (noteId: string, tagIds: string[]): Promise<void> =>
    invoke("set_note_tags", { noteId, tagIds }),
};

export const tagApi = {
  create: (name: string, color: string): Promise<Tag> =>
    invoke("create_tag", { name, color }),
  update: (id: string, updates: { name?: string; color?: string }): Promise<Tag> =>
    invoke("update_tag", { id, ...updates }),
  delete: (id: string): Promise<void> => invoke("delete_tag", { id }),
  list: (): Promise<Tag[]> => invoke("list_tags"),
};

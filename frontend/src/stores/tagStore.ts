import { create } from "zustand";
import { tagApi } from "../lib/tauri";
import type { Tag } from "../types/tag";

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
}

interface TagActions {
  loadTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<void>;
  updateTag: (id: string, updates: { name?: string; color?: string }) => Promise<void>;
}

type TagStore = TagState & TagActions;

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  loadTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagApi.list();
      set({ tags, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  createTag: async (name: string, color: string) => {
    try {
      const tag = await tagApi.create(name, color);
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    } catch (error) {
      set({ error: String(error) });
      return null;
    }
  },

  deleteTag: async (id: string) => {
    try {
      await tagApi.delete(id);
      set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  updateTag: async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const updated = await tagApi.update(id, updates);
      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },
}));

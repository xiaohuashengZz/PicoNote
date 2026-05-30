/**
 * 笔记状态管理模块
 *
 * @description 管理笔记的 CRUD 操作、当前选中状态、列表管理
 * 使用 Zustand 进行状态管理，配合 Tauri Commands 与后端通信
 *
 * @module noteStore
 */
import { create } from "zustand";
import { noteApi } from "../lib/tauri";
import type { Note, WorkspaceId } from "../types/note";

/**
 * 笔记 Store 状态接口
 *
 * @description 定义笔记状态和操作方法
 */
interface NoteState {
  /** 笔记列表 */
  notes: Note[];
  /** 当前选中的笔记 ID */
  currentNoteId: string | null;
  /** 当前选中的笔记对象 */
  currentNote: Note | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

interface NoteActions {
  /** 加载笔记列表 */
  loadNotes: (workspaceId?: WorkspaceId) => Promise<void>;
  /** 选择笔记 */
  selectNote: (id: string | null) => void;
  /** 创建笔记 */
  createNote: (title: string) => Promise<Note | null>;
  /** 更新笔记 */
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  /** 删除笔记 */
  deleteNote: (id: string) => Promise<void>;
  /** 搜索笔记 */
  searchNotes: (keyword: string) => Promise<Note[]>;
  /** 清除错误 */
  clearError: () => void;
  /** 设置当前笔记内容 */
  setCurrentNoteContent: (content: string) => void;
  /** 设置当前笔记标题 */
  setCurrentNoteTitle: (title: string) => void;
}

type NoteStore = NoteState & NoteActions;

/**
 * 笔记状态管理 Store
 *
 * @description 使用 Zustand 管理全局笔记状态
 * 支持从后端加载、创建、更新、删除和搜索笔记
 */
export const useNoteStore = create<NoteStore>((set, get) => ({
  // ========== 状态 ==========

  /** 笔记列表 */
  notes: [],

  /** 当前选中的笔记 ID */
  currentNoteId: null,

  /** 当前选中的笔记对象（缓存） */
  currentNote: null,

  /** 加载状态 */
  isLoading: false,

  /** 错误信息 */
  error: null,

  // ========== 操作 ==========

  /**
   * 加载笔记列表
   *
   * @param workspaceId - 工作区 ID（可选）
   */
  loadNotes: async (workspaceId?: WorkspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteApi.list(workspaceId);
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  /**
   * 选择笔记
   *
   * @param id - 笔记 ID，null 表示取消选择
   */
  selectNote: (id: string | null) => {
    const { notes } = get();
    const currentNote = id ? notes.find((n) => n.id === id) || null : null;
    set({ currentNoteId: id, currentNote });
  },

  /**
   * 创建新笔记
   *
   * @param title - 笔记标题
   * @returns Promise<Note | null> - 创建成功返回笔记对象，否则 null
   */
  createNote: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const note = await noteApi.create(title);
      set((state) => ({
        notes: [note, ...state.notes],
        currentNoteId: note.id,
        currentNote: note,
        isLoading: false,
      }));
      return note;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      return null;
    }
  },

  /**
   * 更新笔记
   *
   * @param id - 笔记 ID
   * @param updates - 更新字段
   */
  updateNote: async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await noteApi.update(id, updates);
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...updatedNote } : n
        ),
        currentNote:
          state.currentNoteId === id
            ? { ...state.currentNote, ...updatedNote }
            : state.currentNote,
      }));
    } catch (error) {
      set({ error: String(error) });
    }
  },

  /**
   * 删除笔记
   *
   * @param id - 笔记 ID
   */
  deleteNote: async (id: string) => {
    try {
      await noteApi.delete(id);
      set((state) => {
        const newNotes = state.notes.filter((n) => n.id !== id);
        return {
          notes: newNotes,
          currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
          currentNote: state.currentNoteId === id ? null : state.currentNote,
        };
      });
    } catch (error) {
      set({ error: String(error) });
    }
  },

  /**
   * 搜索笔记
   *
   * @param keyword - 搜索关键词
   * @returns Promise<SearchResult[]> - 搜索结果
   */
  searchNotes: async (keyword: string) => {
    if (!keyword.trim()) {
      return [];
    }
    try {
      return await noteApi.search(keyword);
    } catch (error) {
      set({ error: String(error) });
      return [];
    }
  },

  /**
   * 清除错误
   */
  clearError: () => set({ error: null }),

  /**
   * 设置当前笔记内容（本地更新，无需等待后端）
   *
   * @param content - 新的内容
   */
  setCurrentNoteContent: (content: string) => {
    const { currentNoteId, currentNote } = get();
    if (currentNoteId && currentNote) {
      set({
        currentNote: { ...currentNote, content },
        notes: get().notes.map((n) =>
          n.id === currentNoteId ? { ...n, content } : n
        ),
      });
    }
  },

  /**
   * 设置当前笔记标题（本地更新）
   *
   * @param title - 新的标题
   */
  setCurrentNoteTitle: (title: string) => {
    const { currentNoteId, currentNote } = get();
    if (currentNoteId && currentNote) {
      set({
        currentNote: { ...currentNote, title },
        notes: get().notes.map((n) =>
          n.id === currentNoteId ? { ...n, title } : n
        ),
      });
    }
  },
}));
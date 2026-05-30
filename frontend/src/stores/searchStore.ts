/**
 * 搜索状态管理模块
 *
 * @description 管理全局搜索的状态和结果
 * 支持关键词搜索、实时搜索和搜索历史
 *
 * @module searchStore
 */
import { create } from "zustand";
import type { Note, SearchResult } from "../types/note";

/**
 * 搜索 Store 状态接口
 */
interface SearchState {
  /** 搜索关键词 */
  query: string;
  /** 搜索结果列表 */
  results: SearchResult[];
  /** 是否正在搜索 */
  isSearching: boolean;
  /** 搜索历史 */
  searchHistory: string[];
}

/**
 * 搜索 Store 操作接口
 */
interface SearchActions {
  /** 设置搜索关键词 */
  setQuery: (query: string) => void;
  /** 执行搜索 */
  search: (keyword: string) => Promise<void>;
  /** 清除搜索结果 */
  clearResults: () => void;
  /** 添加到搜索历史 */
  addToHistory: (keyword: string) => void;
  /** 清除搜索历史 */
  clearHistory: () => void;
}

type SearchStore = SearchState & SearchActions;

/**
 * 从 Tiptap JSON 内容中提取纯文本
 */
function extractTextFromContent(content: string): string {
  try {
    const doc = JSON.parse(content);
    const texts: string[] = [];
    const walk = (node: any) => {
      if (node.text) texts.push(node.text);
      if (node.content) node.content.forEach(walk);
    };
    if (doc.content) doc.content.forEach(walk);
    return texts.join(" ");
  } catch {
    return content;
  }
}

/**
 * 从内容中提取包含关键词的片段
 */
function extractSnippet(content: string, keyword: string): string {
  const text = extractTextFromContent(content);
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) {
    return text.length > 80 ? text.slice(0, 80) + "..." : text;
  }
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + keyword.length + 50);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

/**
 * 搜索状态管理 Store
 *
 * @description 管理全局搜索功能的状态
 */
export const useSearchStore = create<SearchStore>((set, get) => ({
  // ========== 初始状态 ==========

  /** 搜索关键词 */
  query: "",

  /** 搜索结果 */
  results: [],

  /** 加载状态 */
  isSearching: false,

  /** 搜索历史（最近 10 条） */
  searchHistory: [],

  // ========== 操作 ==========

  /**
   * 设置搜索关键词
   */
  setQuery: (query: string) => set({ query }),

  /**
   * 执行搜索
   *
   * @param keyword - 搜索关键词
   */
  search: async (keyword: string) => {
    if (!keyword.trim()) {
      set({ results: [], isSearching: false, query: "" });
      return;
    }

    set({ isSearching: true, query: keyword });

    try {
      // 动态导入 noteApi 以避免循环依赖
      const { noteApi } = await import("../lib/tauri");
      const notes: Note[] = await noteApi.search(keyword);
      const results: SearchResult[] = notes.map((note) => ({
        note_id: note.id,
        title: note.title,
        snippet: extractSnippet(note.content, keyword),
        rank: 1,
      }));
      set({ results, isSearching: false });

      // 添加到搜索历史
      get().addToHistory(keyword);
    } catch (error) {
      console.error("Search failed:", error);
      set({ results: [], isSearching: false });
    }
  },

  /**
   * 清除搜索结果
   */
  clearResults: () => set({ query: "", results: [] }),

  /**
   * 添加到搜索历史
   */
  addToHistory: (keyword: string) => {
    set((state) => {
      const filtered = state.searchHistory.filter((k) => k !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, 10); // 最多保留 10 条
      return { searchHistory: newHistory };
    });
  },

  /**
   * 清除搜索历史
   */
  clearHistory: () => set({ searchHistory: [] }),
}))
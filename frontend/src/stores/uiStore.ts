/**
 * UI 状态管理模块
 *
 * @description 管理应用 UI 相关的状态
 * 包括侧边栏折叠、当前工作区、模态框等
 *
 * @module uiStore
 */
import { create } from "zustand";
import type { WorkspaceId } from "../types/note";

/**
 * UI Store 状态接口
 */
interface UIState {
  /** 左侧工作区侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 中间笔记列表侧边栏是否折叠 */
  noteListCollapsed: boolean;
  /** 当前工作区 ID */
  activeWorkspaceId: WorkspaceId | null;
  /** 全局搜索弹窗是否打开 */
  isSearchOpen: boolean;
  /** 设置弹窗是否打开 */
  isSettingsOpen: boolean;
}

/**
 * UI Store 操作接口
 */
interface UIActions {
  /** 切换工作区侧边栏 */
  toggleSidebar: () => void;
  /** 切换笔记列表侧边栏 */
  toggleNoteList: () => void;
  /** 设置工作区 */
  setActiveWorkspace: (id: WorkspaceId | null) => void;
  /** 打开全局搜索 */
  openSearch: () => void;
  /** 关闭全局搜索 */
  closeSearch: () => void;
  /** 切换全局搜索 */
  toggleSearch: () => void;
  /** 打开设置 */
  openSettings: () => void;
  /** 关闭设置 */
  closeSettings: () => void;
}

type UIStore = UIState & UIActions;

/**
 * UI 状态管理 Store
 *
 * @description 管理应用界面的各种交互状态
 */
export const useUIStore = create<UIStore>((set) => ({
  // ========== 初始状态 ==========

  /** 侧边栏默认不折叠 */
  sidebarCollapsed: false,

  /** 笔记列表默认不折叠 */
  noteListCollapsed: false,

  /** 当前工作区（默认全部） */
  activeWorkspaceId: null,

  /** 全局搜索默认关闭 */
  isSearchOpen: false,

  /** 设置弹窗默认关闭 */
  isSettingsOpen: false,

  // ========== 操作 ==========

  /** 切换工作区侧边栏 */
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  /** 切换笔记列表侧边栏 */
  toggleNoteList: () =>
    set((state) => ({ noteListCollapsed: !state.noteListCollapsed })),

  /** 设置工作区 */
  setActiveWorkspace: (id: WorkspaceId | null) =>
    set({ activeWorkspaceId: id }),

  /** 打开全局搜索 */
  openSearch: () => set({ isSearchOpen: true }),

  /** 关闭全局搜索 */
  closeSearch: () => set({ isSearchOpen: false }),

  /** 切换全局搜索 */
  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  /** 打开设置 */
  openSettings: () => set({ isSettingsOpen: true }),

  /** 关闭设置 */
  closeSettings: () => set({ isSettingsOpen: false }),
}))
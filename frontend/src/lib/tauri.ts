/**
 * Tauri API 封装模块
 *
 * @description 提供与 Tauri 后端通信的类型安全接口
 * 使用 invoke 调用 Rust 端的 Commands
 */
import { invoke } from "@tauri-apps/api/core";
import type { Note, SearchResult } from "../types/note";
import type { Tag } from "../types/tag";

/**
 * 笔记 API 封装
 *
 * @description 提供笔记相关的所有 CRUD 操作
 */
export const noteApi = {
  /**
   * 创建新笔记
   * @param title - 笔记标题
   * @returns Promise<Note> - 创建的笔记
   */
  create: (title: string): Promise<Note> => invoke("create_note", { title }),

  /**
   * 更新笔记
   * @param id - 笔记 ID
   * @param updates - 更新字段
   * @returns Promise<Note> - 更新后的笔记
   */
  update: (
    id: string,
    updates: {
      title?: string;
      content?: string;
      is_pinned?: boolean;
      is_archived?: boolean;
      is_favorite?: boolean;
    }
  ): Promise<Note> =>
    invoke("update_note", { id, ...updates }),

  /**
   * 删除笔记
   * @param id - 笔记 ID
   */
  delete: (id: string): Promise<void> => invoke("delete_note", { id }),

  /**
   * 获取单个笔记
   * @param id - 笔记 ID
   * @returns Promise<Note | null> - 找到返回笔记，否则 null
   */
  get: (id: string): Promise<Note | null> => invoke("get_note", { id }),

  /**
   * 获取笔记列表
   * @param workspaceId - 工作区 ID（可选）
   * @param offset - 偏移量
   * @param limit - 返回数量限制
   * @returns Promise<Note[]> - 笔记列表
   */
  list: (
    workspaceId?: string,
    offset?: number,
    limit?: number
  ): Promise<Note[]> =>
    invoke("list_notes", {
      workspace_id: workspaceId,
      offset,
      limit,
    }),

  /**
   * 搜索笔记
   * @param keyword - 搜索关键词
   * @param limit - 返回数量限制
   * @returns Promise<SearchResult[]> - 搜索结果列表
   */
  search: (keyword: string, limit?: number): Promise<SearchResult[]> =>
    invoke("search_notes", { keyword, limit }),
};

/**
 * 标签 API 封装
 *
 * @description 提供标签相关的 CRUD 操作
 */
export const tagApi = {
  /**
   * 创建新标签
   * @param name - 标签名称
   * @param color - 标签颜色
   * @returns Promise<Tag> - 创建的标签
   */
  create: (name: string, color: string): Promise<Tag> =>
    invoke("create_tag", { name, color }),

  /**
   * 更新标签
   * @param id - 标签 ID
   * @param updates - 更新字段
   * @returns Promise<Tag> - 更新后的标签
   */
  update: (
    id: string,
    updates: { name?: string; color?: string }
  ): Promise<Tag> => invoke("update_tag", { id, ...updates }),

  /**
   * 删除标签
   * @param id - 标签 ID
   */
  delete: (id: string): Promise<void> => invoke("delete_tag", { id }),

  /**
   * 获取标签列表
   * @returns Promise<Tag[]> - 标签列表
   */
  list: (): Promise<Tag[]> => invoke("list_tags"),
};
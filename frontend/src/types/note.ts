/**
 * 笔记类型定义
 *
 * @description 定义笔记数据模型的前端 TypeScript 类型
 * 与后端 Rust 结构体 NoteModel 对应
 */

/**
 * 笔记数据模型
 *
 * @description 前端笔记数据结构，与 Tauri 后端共享
 */
export interface Note {
  /** 唯一标识符，UUID 格式 */
  id: string;
  /** 笔记标题 */
  title: string;
  /** 笔记内容，Tiptap JSON 格式 */
  content: string;
  /** 是否置顶 */
  is_pinned: boolean;
  /** 是否归档 */
  is_archived: boolean;
  /** 是否收藏 */
  is_favorite: boolean;
  /** 创建时间戳（毫秒） */
  created_at: number;
  /** 更新时间戳（毫秒） */
  updated_at: number;
}

/**
 * 创建笔记的参数
 */
export interface CreateNoteParams {
  /** 笔记标题 */
  title: string;
}

/**
 * 更新笔记的参数
 */
export interface UpdateNoteParams {
  /** 笔记 ID */
  id: string;
  /** 新标题（可选） */
  title?: string;
  /** 新内容（可选） */
  content?: string;
  /** 是否置顶（可选） */
  is_pinned?: boolean;
  /** 是否归档（可选） */
  is_archived?: boolean;
  /** 是否收藏（可选） */
  is_favorite?: boolean;
}

/**
 * 搜索结果结构
 *
 * @description 搜索功能返回的结果类型
 */
export interface SearchResult {
  /** 匹配的笔记 ID */
  note_id: string;
  /** 笔记标题 */
  title: string;
  /** 内容摘要（带高亮标记） */
  snippet: string;
  /** 相关性排名分数 */
  rank: number;
}

/**
 * 工作区类型
 *
 * @description 预设的笔记筛选条件
 */
export type WorkspaceId = "today" | "recent" | "favorites" | "archived" | string;

/**
 * 工作区定义
 *
 * @description 工作区包含 ID、名称和图标
 */
export interface Workspace {
  /** 工作区 ID */
  id: WorkspaceId;
  /** 工作区名称 */
  name: string;
  /** 工作区图标（ emoji） */
  icon: string;
}
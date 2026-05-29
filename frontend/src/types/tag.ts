/**
 * 标签类型定义
 *
 * @description 定义标签数据模型的 TypeScript 类型
 */

/**
 * 标签数据模型
 *
 * @description 前端标签数据结构，与后端 Rust 结构体 TagModel 对应
 */
export interface Tag {
  /** 唯一标识符，UUID 格式 */
  id: string;
  /** 标签名称，唯一且不能为空 */
  name: string;
  /** 标签颜色，十六进制格式（如 #3b82f6） */
  color: string;
}

/**
 * 创建标签的参数
 */
export interface CreateTagParams {
  /** 标签名称 */
  name: string;
  /** 标签颜色 */
  color: string;
}

/**
 * 更新标签的参数
 */
export interface UpdateTagParams {
  /** 标签 ID */
  id: string;
  /** 新名称（可选） */
  name?: string;
  /** 新颜色（可选） */
  color?: string;
}
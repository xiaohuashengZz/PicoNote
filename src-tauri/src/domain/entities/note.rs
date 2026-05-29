//! 笔记实体模块
//!
//! @description 定义笔记(Note)数据模型的 ORM 映射
//! 使用 sea-orm 框架进行数据库操作，支持 SQLite

use sea_orm::entity::prelude::*;

/// 笔记实体模型
///
/// # 结构说明
/// 对应数据库中的 `notes` 表，包含笔记的所有属性
#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "notes")]
pub struct Model {
    /// 唯一标识符，UUID 格式
    #[sea_orm(primary_key)]
    pub id: String,

    /// 笔记标题
    #[sea_orm(column_name = "title")]
    pub title: String,

    /// 笔记内容，Tiptap JSON 格式序列化存储
    #[sea_orm(column_name = "content", column_type = "Text")]
    pub content: String,

    /// 是否置顶
    #[sea_orm(column_name = "is_pinned", default_value = "false")]
    pub is_pinned: bool,

    /// 是否归档
    #[sea_orm(column_name = "is_archived", default_value = "false")]
    pub is_archived: bool,

    /// 是否收藏
    #[sea_orm(column_name = "is_favorite", default_value = "false")]
    pub is_favorite: bool,

    /// 创建时间戳（毫秒）
    #[sea_orm(column_name = "created_at")]
    pub created_at: i64,

    /// 更新时间戳（毫秒）
    #[sea_orm(column_name = "updated_at")]
    pub updated_at: i64,
}

/// 主动模型行为实现
/// 提供创建、更新、删除等操作的默认行为
impl ActiveModelBehavior for ActiveModel {}
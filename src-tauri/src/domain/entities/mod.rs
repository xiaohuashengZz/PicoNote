//! 数据库实体模块
//!
//! @description 定义笔记(Note)、标签(Tag)等核心数据模型的 ORM 映射
//! 使用 sea-orm 框架进行数据库操作

pub mod note;
pub mod tag;

pub use note::Entity as NoteEntity;
pub use tag::Entity as TagEntity;
//! 仓储模式实现模块
//!
//! @description 提供数据访问层的实现，封装数据库操作
//! 使用 sea-orm 进行类型安全的数据库查询

pub mod note_repository;

pub use note_repository::NoteRepository;
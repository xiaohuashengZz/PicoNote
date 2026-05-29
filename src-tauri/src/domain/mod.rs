//! 领域层模块
//!
//! @description 定义核心业务实体和数据模型
//! 采用 DDD 分层架构的领域层

pub mod entities;

pub use entities::NoteEntity;
pub use entities::TagEntity;
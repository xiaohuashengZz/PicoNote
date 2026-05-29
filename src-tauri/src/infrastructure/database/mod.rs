//! 基础设施层 - 数据库模块
//!
//! @description 提供数据库连接管理、仓储模式实现
//! 使用 rusqlite + SQLite

pub mod connection;
pub mod migrations;
pub mod repository;

pub use connection::DbPool;
pub use repository::NoteRepository;
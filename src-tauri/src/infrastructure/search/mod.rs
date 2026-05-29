//! 基础设施层 - 搜索模块
//!
//! @description 提供 FTS5 全文搜索功能
//! 使用 SQLite 内置的 FTS5 虚拟表实现高性能全文检索

pub mod fts5;

pub use fts5::{SearchService, SearchResult};
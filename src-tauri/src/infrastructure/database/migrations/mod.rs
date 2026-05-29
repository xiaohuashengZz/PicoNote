//! 数据库迁移模块
//!
//! @description 提供数据库表创建和初始化

use rusqlite::Connection;
use tracing::info;

/// 运行数据库迁移
///
/// @description 创建应用所需的所有数据库表
pub async fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    info!("Running database migrations...");

    // 创建 notes 表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL DEFAULT '',
            content TEXT NOT NULL DEFAULT '{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\"}]}',
            is_pinned INTEGER NOT NULL DEFAULT 0,
            is_archived INTEGER NOT NULL DEFAULT 0,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )",
        [],
    )?;
    info!("Created notes table");

    // 创建 tags 表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE,
            color TEXT NOT NULL DEFAULT '#3b82f6'
        )",
        [],
    )?;
    info!("Created tags table");

    // 创建 note_tags 关联表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS note_tags (
            note_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )",
        [],
    )?;
    info!("Created note_tags table");

    // 创建索引
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite)", [])?;
    info!("Created database indices");

    info!("Database migrations completed");
    Ok(())
}
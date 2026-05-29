//! 数据库连接池模块
//!
//! @description 管理 SQLite 数据库连接

use rusqlite::Connection;
use std::sync::Arc;
use parking_lot::Mutex;
use tracing::info;

/// 数据库连接池类型
pub type DbPool = Arc<Mutex<Connection>>;

/// 初始化数据库连接
///
/// @param database_url - 数据库路径
/// @return Result<DbPool> - 成功返回连接池
pub async fn init_database(database_url: &str) -> Result<DbPool, rusqlite::Error> {
    info!("Initializing database connection: {}", database_url);

    // 移除 sqlite:// 前缀，转换为文件路径
    let db_path = database_url.trim_start_matches("sqlite://").trim_end_matches("?mode=rwc");
    let conn = Connection::open(db_path)?;

    info!("Database connection established successfully");
    Ok(Arc::new(Mutex::new(conn)))
}
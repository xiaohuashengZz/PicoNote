//! 笔记仓储模块
//!
//! @description 实现笔记数据的数据库访问操作
//! 使用 rusqlite 进行 SQLite 数据库操作

use crate::infrastructure::database::DbPool;
use serde::{Deserialize, Serialize};

/// 搜索结果结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub note_id: String,
    pub title: String,
    pub snippet: String,
    pub rank: f64,
}

/// 笔记数据模型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub is_pinned: bool,
    pub is_archived: bool,
    pub is_favorite: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 笔记仓储
pub struct NoteRepository {
    db: DbPool,
}

impl NoteRepository {
    /// 创建新的笔记仓储
    pub fn new(db: DbPool) -> Self {
        Self { db }
    }

    /// 创建笔记
    pub async fn create(&self, title: String, content: String) -> Result<Note, String> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp_millis();

        let note = Note {
            id: id.clone(),
            title,
            content,
            is_pinned: false,
            is_archived: false,
            is_favorite: false,
            created_at: now,
            updated_at: now,
        };

        let conn = self.db.lock();
        conn.execute(
            "INSERT INTO notes (id, title, content, is_pinned, is_archived, is_favorite, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![
                note.id,
                note.title,
                note.content,
                note.is_pinned as i32,
                note.is_archived as i32,
                note.is_favorite as i32,
                note.created_at,
                note.updated_at
            ],
        )
        .map_err(|e| e.to_string())?;

        Ok(note)
    }

    /// 更新笔记
    #[allow(clippy::too_many_arguments)]
    pub async fn update(
        &self,
        id: String,
        title: Option<String>,
        content: Option<String>,
        is_pinned: Option<bool>,
        _is_archived: Option<bool>,
        is_favorite: Option<bool>,
    ) -> Result<Note, String> {
        let now = chrono::Utc::now().timestamp_millis();
        let conn = self.db.lock();

        // 构建更新语句
        let mut updates = Vec::new();

        if title.is_some() {
            updates.push("title = ?1");
        }
        if content.is_some() {
            updates.push("content = ?2");
        }
        if is_pinned.is_some() {
            updates.push("is_pinned = ?3");
        }
        if is_favorite.is_some() {
            updates.push("is_favorite = ?4");
        }
        updates.push("updated_at = ?5");

        let sql = format!("UPDATE notes SET {} WHERE id = ?6", updates.join(", "));

        // 使用 rusqlite::params 进行参数绑定
        conn.execute(
            &sql,
            rusqlite::params![
                title.as_deref(),
                content.as_deref(),
                is_pinned.map(|p| p as i32),
                is_favorite.map(|f| f as i32),
                now,
                id
            ],
        )
        .map_err(|e| e.to_string())?;

        // 查询更新后的笔记
        let mut stmt = conn
            .prepare("SELECT id, title, content, is_pinned, is_archived, is_favorite, created_at, updated_at FROM notes WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let note = stmt
            .query_row([&id], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    is_pinned: row.get::<_, i32>(3)? != 0,
                    is_archived: row.get::<_, i32>(4)? != 0,
                    is_favorite: row.get::<_, i32>(5)? != 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(note)
    }

    /// 删除笔记
    pub async fn delete(&self, id: String) -> Result<(), String> {
        let conn = self.db.lock();
        conn.execute("DELETE FROM notes WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    /// 根据 ID 获取笔记
    pub async fn find_by_id(&self, id: &str) -> Result<Option<Note>, String> {
        let conn = self.db.lock();
        let mut stmt = conn
            .prepare("SELECT id, title, content, is_pinned, is_archived, is_favorite, created_at, updated_at FROM notes WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let result = stmt.query_row([id], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                is_pinned: row.get::<_, i32>(3)? != 0,
                is_archived: row.get::<_, i32>(4)? != 0,
                is_favorite: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        });

        match result {
            Ok(note) => Ok(Some(note)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    /// 获取笔记列表
    pub async fn list(
        &self,
        workspace_id: Option<String>,
        offset: u64,
        limit: u64,
    ) -> Result<Vec<Note>, String> {
        let conn = self.db.lock();

        let mut sql = String::from("SELECT id, title, content, is_pinned, is_archived, is_favorite, created_at, updated_at FROM notes WHERE 1=1");
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        // 根据工作区筛选
        if let Some(ws_id) = &workspace_id {
            match ws_id.as_str() {
                "today" => {
                    let today_start = chrono::Utc::now()
                        .date_naive()
                        .and_hms_opt(0, 0, 0)
                        .unwrap()
                        .and_utc()
                        .timestamp_millis();
                    sql.push_str(" AND updated_at >= ?");
                    params.push(Box::new(today_start));
                }
                "recent" => {
                    let week_ago = chrono::Utc::now().timestamp_millis() - (7 * 24 * 60 * 60 * 1000);
                    sql.push_str(" AND updated_at >= ?");
                    params.push(Box::new(week_ago));
                }
                "favorites" => {
                    sql.push_str(" AND is_favorite = 1");
                }
                "archived" => {
                    sql.push_str(" AND is_archived = 1");
                }
                _ => {}
            }
        } else {
            // 默认排除已归档的笔记
            sql.push_str(" AND is_archived = 0");
        }

        sql.push_str(" ORDER BY is_pinned DESC, updated_at DESC LIMIT ? OFFSET ?");
        params.push(Box::new(limit as i64));
        params.push(Box::new(offset as i64));

        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let notes = stmt
            .query_map(params_refs.as_slice(), |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    is_pinned: row.get::<_, i32>(3)? != 0,
                    is_archived: row.get::<_, i32>(4)? != 0,
                    is_favorite: row.get::<_, i32>(5)? != 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        Ok(notes)
    }

    /// 搜索笔记
    pub async fn search(&self, keyword: &str, limit: usize) -> Result<Vec<Note>, String> {
        let conn = self.db.lock();
        let pattern = format!("%{}%", keyword);

        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, is_pinned, is_archived, is_favorite, created_at, updated_at
                 FROM notes
                 WHERE title LIKE ? OR content LIKE ?
                 ORDER BY updated_at DESC
                 LIMIT ?",
            )
            .map_err(|e| e.to_string())?;

        let notes = stmt
            .query_map(rusqlite::params![&pattern, &pattern, limit as i64], |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    is_pinned: row.get::<_, i32>(3)? != 0,
                    is_archived: row.get::<_, i32>(4)? != 0,
                    is_favorite: row.get::<_, i32>(5)? != 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        Ok(notes)
    }
}
//! 标签命令模块
//!
//! @description 实现标签相关的Tauri Commands

use crate::infrastructure::database::DbPool;
use serde::{Deserialize, Serialize};
use tauri::State;
use tracing::info;

/// 标签数据模型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
}

/// 创建标签
#[tauri::command]
pub async fn create_tag(
    db: State<'_, DbPool>,
    name: String,
    color: String,
) -> Result<Tag, String> {
    info!("Command: create_tag - name: {}, color: {}", name, color);

    let id = uuid::Uuid::new_v4().to_string();
    let tag = Tag { id: id.clone(), name, color };

    let conn = db.lock();
    conn.execute(
        "INSERT INTO tags (id, name, color) VALUES (?1, ?2, ?3)",
        [&id, &tag.name, &tag.color],
    )
    .map_err(|e| e.to_string())?;

    Ok(tag)
}

/// 更新标签
#[tauri::command]
pub async fn update_tag(
    db: State<'_, DbPool>,
    id: String,
    name: Option<String>,
    color: Option<String>,
) -> Result<Tag, String> {
    info!("Command: update_tag - id: {}", id);

    let conn = db.lock();

    if let Some(n) = &name {
        conn.execute("UPDATE tags SET name = ?1 WHERE id = ?2", [n, &id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(c) = &color {
        conn.execute("UPDATE tags SET color = ?1 WHERE id = ?2", [c, &id])
            .map_err(|e| e.to_string())?;
    }

    let mut stmt = conn
        .prepare("SELECT id, name, color FROM tags WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let tag = stmt
        .query_row([&id], |row| Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
        }))
        .map_err(|e| e.to_string())?;

    Ok(tag)
}

/// 删除标签
#[tauri::command]
pub async fn delete_tag(
    db: State<'_, DbPool>,
    id: String,
) -> Result<(), String> {
    info!("Command: delete_tag - id: {}", id);
    let conn = db.lock();
    conn.execute("DELETE FROM tags WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// 获取标签列表
#[tauri::command]
pub async fn list_tags(
    db: State<'_, DbPool>,
) -> Result<Vec<Tag>, String> {
    info!("Command: list_tags");
    let conn = db.lock();

    let mut stmt = conn
        .prepare("SELECT id, name, color FROM tags ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tags)
}
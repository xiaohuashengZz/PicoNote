//! 笔记命令模块
//!
//! @description 实现笔记相关的 Tauri Commands
//! 提供前端调用的笔记 CRUD API

use crate::infrastructure::database::{DbPool, repository::note_repository::{Note, NoteRepository}};
use crate::application::commands::tag_commands::Tag;
use tauri::State;
use tracing::info;

/// 创建新笔记
#[tauri::command(rename_all = "snake_case")]
pub async fn create_note(
    db: State<'_, DbPool>,
    title: String,
) -> Result<Note, String> {
    info!("Command: create_note - title: {}", title);
    let repo = NoteRepository::new(DbPool::clone(&db));
    let content = r#"{"type":"doc","content":[{"type":"paragraph"}]}"#.to_string();
    repo.create(title, content).await
}

/// 更新笔记
#[tauri::command(rename_all = "snake_case")]
pub async fn update_note(
    db: State<'_, DbPool>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    is_pinned: Option<bool>,
    is_archived: Option<bool>,
    is_favorite: Option<bool>,
) -> Result<Note, String> {
    info!("Command: update_note - id: {}", id);
    let repo = NoteRepository::new(DbPool::clone(&db));
    repo.update(id, title, content, is_pinned, is_archived, is_favorite).await
}

/// 删除笔记
#[tauri::command(rename_all = "snake_case")]
pub async fn delete_note(
    db: State<'_, DbPool>,
    id: String,
) -> Result<(), String> {
    info!("Command: delete_note - id: {}", id);
    let repo = NoteRepository::new(DbPool::clone(&db));
    repo.delete(id).await
}

/// 获取单个笔记
#[tauri::command(rename_all = "snake_case")]
pub async fn get_note(
    db: State<'_, DbPool>,
    id: String,
) -> Result<Option<Note>, String> {
    info!("Command: get_note - id: {}", id);
    let repo = NoteRepository::new(DbPool::clone(&db));
    repo.find_by_id(&id).await
}

/// 获取笔记列表
#[tauri::command(rename_all = "snake_case")]
pub async fn list_notes(
    db: State<'_, DbPool>,
    workspace_id: Option<String>,
    offset: Option<u64>,
    limit: Option<u64>,
) -> Result<Vec<Note>, String> {
    info!("Command: list_notes - workspace: {:?}, offset: {:?}, limit: {:?}", workspace_id, offset, limit);
    let repo = NoteRepository::new(DbPool::clone(&db));
    repo.list(workspace_id, offset.unwrap_or(0), limit.unwrap_or(50)).await
}

/// 搜索笔记
#[tauri::command(rename_all = "snake_case")]
pub async fn search_notes(
    db: State<'_, DbPool>,
    keyword: String,
    limit: Option<usize>,
) -> Result<Vec<Note>, String> {
    info!("Command: search_notes - keyword: {}", keyword);
    let repo = NoteRepository::new(DbPool::clone(&db));
    repo.search(&keyword, limit.unwrap_or(20)).await
}

/// 获取笔记的标签
#[tauri::command(rename_all = "snake_case")]
pub async fn get_note_tags(
    db: State<'_, DbPool>,
    note_id: String,
) -> Result<Vec<Tag>, String> {
    info!("Command: get_note_tags - note_id: {}", note_id);
    let conn = db.lock();

    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color FROM tags t
             INNER JOIN note_tags nt ON t.id = nt.tag_id
             WHERE nt.note_id = ?1
             ORDER BY t.name ASC",
        )
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([&note_id], |row| {
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

/// 设置笔记的标签（替换）
#[tauri::command(rename_all = "snake_case")]
pub async fn set_note_tags(
    db: State<'_, DbPool>,
    note_id: String,
    tag_ids: Vec<String>,
) -> Result<(), String> {
    info!("Command: set_note_tags - note_id: {}, tags: {:?}", note_id, tag_ids);
    let conn = db.lock();

    // 删除旧关联
    conn.execute("DELETE FROM note_tags WHERE note_id = ?1", [&note_id])
        .map_err(|e| e.to_string())?;

    // 插入新关联
    for tag_id in &tag_ids {
        conn.execute(
            "INSERT INTO note_tags (note_id, tag_id) VALUES (?1, ?2)",
            [&note_id, tag_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
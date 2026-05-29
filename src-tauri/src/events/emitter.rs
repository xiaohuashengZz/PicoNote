//! 事件发射器模块
//!
//! @description 定义应用内的事件类型和事件发射器
//! 提供简单的事件发布-订阅模式支持
//!
//! # 支持的事件类型
//! - note:created - 笔记创建
//! - note:updated - 笔记更新
//! - note:deleted - 笔记删除
//! - tag:created - 标签创建
//! - tag:deleted - 标签删除
//! - theme:changed - 主题变更

use std::sync::Arc;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

/// 应用事件类型
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum AppEvent {
    /// 笔记创建事件
    NoteCreated { note_id: String },
    /// 笔记更新事件
    NoteUpdated { note_id: String, fields: Vec<String> },
    /// 笔记删除事件
    NoteDeleted { note_id: String },
    /// 标签创建事件
    TagCreated { tag_id: String, name: String },
    /// 标签删除事件
    TagDeleted { tag_id: String },
    /// 主题变更事件
    ThemeChanged { theme: String },
}

/// 应用事件发射器
///
/// @description 使用 RwLock 实现的事件发射器
/// 供各个模块发布事件使用
pub type AppEventEmitter = Arc<RwLock<Vec<(AppEvent, usize)>>>;

/// 事件监听器计数器
static LISTENER_ID: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);

/// 创建新的事件发射器实例
///
/// @return AppEventEmitter 新的发射器
pub fn create_emitter() -> AppEventEmitter {
    Arc::new(RwLock::new(Vec::new()))
}
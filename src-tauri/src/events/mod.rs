//! 事件模块
//!
//! @description 基于 nanoemma 的轻量级事件系统
//! 用于模块间解耦通信，支持事件发布-订阅模式

pub mod emitter;

pub use emitter::{AppEvent, AppEventEmitter};
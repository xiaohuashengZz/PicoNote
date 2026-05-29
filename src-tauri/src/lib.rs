//! PicoNote 库模块
//!
//! @description 库的根模块，导出所有公共接口
//! 采用分层架构：application -> infrastructure

pub mod application;
pub mod infrastructure;
pub mod events;
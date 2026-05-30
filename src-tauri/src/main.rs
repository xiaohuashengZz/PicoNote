#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! PicoNote 主程序入口
//!
//! @description Tauri 桌面应用程序的入口点
//! 负责初始化数据库和应用

use piconote_lib::infrastructure::database::connection::init_database;
use piconote_lib::infrastructure::database::migrations::run_migrations;
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use std::sync::Arc;

fn main() {
    // 初始化日志
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .with_target(true)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set tracing subscriber");

    info!("Starting PicoNote application...");

    // 初始化数据库
    let db_pool = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("Failed to create tokio runtime")
        .block_on(async {
            let pool = init_database("sqlite://piconote.db?mode=rwc")
                .await
                .expect("Failed to initialize database");
            let pool_clone = Arc::clone(&pool);
            run_migrations(&pool_clone.lock()).await.expect("Failed to run migrations");
            pool
        });

    info!("Database initialized successfully");

    // 构建并启动 Tauri 应用
    tauri::Builder::default()
        .manage(db_pool)
        .invoke_handler(tauri::generate_handler![
            piconote_lib::application::commands::note_commands::create_note,
            piconote_lib::application::commands::note_commands::update_note,
            piconote_lib::application::commands::note_commands::delete_note,
            piconote_lib::application::commands::note_commands::get_note,
            piconote_lib::application::commands::note_commands::list_notes,
            piconote_lib::application::commands::note_commands::search_notes,
            piconote_lib::application::commands::tag_commands::create_tag,
            piconote_lib::application::commands::tag_commands::update_tag,
            piconote_lib::application::commands::tag_commands::delete_tag,
            piconote_lib::application::commands::tag_commands::list_tags,
            piconote_lib::application::commands::note_commands::get_note_tags,
            piconote_lib::application::commands::note_commands::set_note_tags,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running PicoNote application");
}
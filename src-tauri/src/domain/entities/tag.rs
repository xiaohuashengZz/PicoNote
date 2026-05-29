//! 标签实体模块
//!
//! @description 定义标签(Tag)数据模型的 ORM 映射
//! 标签用于对笔记进行分类和筛选

use sea_orm::entity::prelude::*;

/// 标签实体模型
///
/// # 结构说明
/// 对应数据库中的 `tags` 表
#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    /// 唯一标识符，UUID 格式
    #[sea_orm(primary_key)]
    pub id: String,

    /// 标签名称，唯一且不能为空
    #[sea_orm(column_name = "name", unique)]
    pub name: String,

    /// 标签颜色，十六进制格式，默认为蓝色
    #[sea_orm(column_name = "color", default_value = "#3b82f6")]
    pub color: String,
}

/// 主动模型行为实现
impl ActiveModelBehavior for ActiveModel {}
# PicoNote

轻量级本地笔记应用，基于 Tauri + React + TypeScript 构建。

## 功能特性

- **本地优先**: 使用 SQLite 本地存储，无需云端
- **标签系统**: 通过标签组织和筛选笔记
- **富文本编辑**: 基于 Tiptap，支持 Markdown
- **快速搜索**: 全局搜索笔记和标签
- **自动保存**: 更改自动保存
- **深色/浅色主题**: 主题切换并持久化

## 技术栈

- **后端**: Rust + Tauri 2.0
- **前端**: React + TypeScript + Vite
- **数据库**: SQLite (rusqlite)
- **编辑器**: Tiptap

## 开发

### 环境要求

- Node.js 18+
- Rust 1.70+
- npm

### 安装运行

```bash
# 安装前端依赖
cd frontend && npm install

# 开发模式运行
npm run dev
```

### 构建

```bash
npm run build
```

## 项目结构

```
src-tauri/          Rust 后端
  src/
    application/    应用层（命令、事件）
    domain/         领域模型
    infrastructure/ 数据库仓储
frontend/           React 前端
  src/
    components/     UI 组件
    stores/         状态管理
    hooks/          自定义 Hooks
    types/          TypeScript 类型
```

## 开源许可

Apache 2.0
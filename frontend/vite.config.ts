/**
 * Vite 构建配置文件
 *
 * @description 配置前端构建工具 Vite，用于开发服务器和生产构建
 * 支持 React + TypeScript，并配置 Tauri 集成
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // 插件配置
  plugins: [react()],

  // 开发服务器配置
  server: {
    // 开发服务器端口
    port: 1420,
    // 启用严格端口检查（端口被占用时直接退出）
    strictPort: true,
    // 监听所有网络接口，允许局域网访问
    host: true,
  },

  // 构建配置
  build: {
    // 构建输出目录（相对于 package.json）
    outDir: "dist",
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用子资源完整性
    subresourceIntegrity: false,
  },

  // 清除屏幕
  clearScreen: false,

  // 环境变量前缀
  envPrefix: ["VITE_", "TAURI_"],

  // 继承系统环境变量
  envFile: ".env",
});
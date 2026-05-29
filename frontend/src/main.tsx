/**
 * PicoNote 主入口文件
 *
 * @description 应用的主入口点
 * 负责渲染 React 根组件到 DOM
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * 渲染应用到 DOM
 *
 * @description 使用 React 18 的 createRoot API 渲染应用
 * 容器元素为 index.html 中的 #root div
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
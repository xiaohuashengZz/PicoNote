/**
 * PicoNote 应用根组件
 *
 * @description 应用的主入口组件
 * 负责初始化主题、布局和全局状态
 *
 * @module App
 */
import { useEffect } from "react";
import ThreeColumnLayout from "./components/Layout/ThreeColumnLayout";
import GlobalSearch from "./components/Search/GlobalSearch";
import Settings from "./components/Settings/Settings";
import { useThemeStore } from "./stores/themeStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import "./App.css";

/**
 * 主应用组件
 */
export default function App() {
  const { initTheme } = useThemeStore();

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // 注册全局快捷键
  useKeyboardShortcuts();

  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <TopNav />

      {/* 主内容区域 */}
      <main className="app-main">
        <ThreeColumnLayout />
      </main>

      {/* 全局搜索弹窗 */}
      <GlobalSearch />

      {/* 设置弹窗 */}
      <Settings />
    </div>
  );
}

/**
 * 顶部导航栏组件
 */
function TopNav() {
  const { toggleDark, toggleLight, theme } = useThemeStore();

  return (
    <nav className="top-nav">
      {/* 应用标题 */}
      <h1 className="app-title">PicoNote</h1>

      {/* 右侧操作按钮 */}
      <div className="nav-actions">
        {/* 主题切换 */}
        <button
          className="icon-btn"
          onClick={() => (theme === "dark" ? toggleLight() : toggleDark())}
          title={theme === "dark" ? "切换到亮色" : "切换到暗色"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
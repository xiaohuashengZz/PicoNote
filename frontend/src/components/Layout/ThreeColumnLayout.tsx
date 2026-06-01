/**
 * 三栏布局组件
 *
 * @description 应用的主布局，包含：
 * - 左侧：工作区侧边栏
 * - 中间：笔记列表
 * - 右侧：编辑器
 *
 * 支持侧边栏折叠功能
 *
 * @module ThreeColumnLayout
 */
import { useUIStore } from "../../stores/uiStore";
import Sidebar from "./Sidebar";
import NoteList from "./NoteList";
import EditorPanel from "./EditorPanel";
import "./ThreeColumnLayout.css";

/**
 * 三栏布局组件
 */
export default function ThreeColumnLayout() {
  // 从 UI Store 获取侧边栏折叠状态
  const { sidebarCollapsed, noteListCollapsed } = useUIStore();

  return (
    <div className={`three-column-layout ${sidebarCollapsed ? "collapsed" : ""}`}>
      <aside
        className={`layout-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      >
        <Sidebar />
      </aside>

      {/* 中间笔记列表 */}
      <div
        className={`layout-note-list ${noteListCollapsed ? "collapsed" : ""}`}
      >
        <NoteList />
      </div>

      {/* 右侧编辑器 */}
      <main className="layout-editor">
        <EditorPanel />
      </main>
    </div>
  );
}
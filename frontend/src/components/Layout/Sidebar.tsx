/**
 * 侧边栏组件
 *
 * @description 工作区导航侧边栏
 * 显示工作区列表、标签列表和快捷操作
 *
 * @module Sidebar
 */
import { useUIStore } from "../../stores/uiStore";
import { useNoteStore } from "../../stores/noteStore";
import type { Workspace, WorkspaceId } from "../../types/note";
import "./Sidebar.css";

/**
 * 预设工作区列表
 */
const PRESET_WORKSPACES: Workspace[] = [
  { id: "today", name: "今天", icon: "📅" },
  { id: "recent", name: "最近 7 天", icon: "🕐" },
  { id: "favorites", name: "收藏", icon: "⭐" },
];

/**
 * 侧边栏组件
 */
export default function Sidebar() {
  const { activeWorkspaceId, setActiveWorkspace, toggleSidebar, openSearch, openSettings } = useUIStore();
  const { loadNotes } = useNoteStore();

  /**
   * 切换工作区
   */
  const handleWorkspaceClick = async (workspaceId: WorkspaceId | null) => {
    setActiveWorkspace(workspaceId);
    await loadNotes(workspaceId ?? undefined);
  };

  return (
    <div className="sidebar">
      {/* 工作区头部 */}
      <div className="sidebar-header">
        <div className="workspace-brand">
          <div className="workspace-icon">📝</div>
          <span className="workspace-name">我的笔记</span>
        </div>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title="折叠侧边栏"
        >
          ◀
        </button>
      </div>

      {/* 搜索框 */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="搜索... (Ctrl+K)"
          readOnly
          onClick={openSearch}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* 导航区域 */}
      <nav className="sidebar-nav">
        {/* 快捷访问分区 */}
        <div className="nav-section">
          <div className="nav-section-title">快捷访问</div>

          {/* 全部笔记 */}
          <button
            className={`nav-item ${activeWorkspaceId === null ? "active" : ""}`}
            onClick={() => handleWorkspaceClick(null)}
          >
            <span className="nav-item-icon">📚</span>
            <span className="nav-item-text">全部笔记</span>
          </button>

          {/* 预设工作区 */}
          {PRESET_WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              className={`nav-item ${
                activeWorkspaceId === ws.id ? "active" : ""
              }`}
              onClick={() => handleWorkspaceClick(ws.id)}
            >
              <span className="nav-item-icon">{ws.icon}</span>
              <span className="nav-item-text">{ws.name}</span>
            </button>
          ))}
        </div>

        {/* 标签分区 */}
        <div className="nav-section">
          <div className="nav-section-title">标签</div>
          <button className="nav-item">
            <span className="nav-item-icon" style={{ color: "#f59e0b" }}>
              ●
            </span>
            <span className="nav-item-text"># 工作</span>
          </button>
          <button className="nav-item">
            <span className="nav-item-icon" style={{ color: "#10b981" }}>
              ●
            </span>
            <span className="nav-item-text"># 灵感</span>
          </button>
          <button className="nav-item">
            <span className="nav-item-icon" style={{ color: "#8b5cf6" }}>
              ●
            </span>
            <span className="nav-item-text"># 架构设计</span>
          </button>
        </div>
      </nav>

      {/* 底部设置入口 */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={openSettings}>
          <span className="nav-item-icon">⚙️</span>
          <span className="nav-item-text">设置</span>
        </button>
      </div>
    </div>
  );
}
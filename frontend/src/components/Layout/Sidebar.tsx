import { useEffect, useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
import type { Workspace, WorkspaceId } from "../../types/note";
import "./Sidebar.css";

const PRESET_WORKSPACES: Workspace[] = [
  { id: "today", name: "今天", icon: "📅" },
  { id: "recent", name: "最近 7 天", icon: "🕐" },
  { id: "favorites", name: "收藏", icon: "⭐" },
];

const PRESET_COLORS = [
  "#f59e0b", "#10b981", "#8b5cf6", "#3b82f6",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
];

export default function Sidebar() {
  const {
    activeWorkspaceId,
    setActiveWorkspace,
    sidebarCollapsed,
    toggleSidebar,
    openSearch,
    openSettings,
  } = useUIStore();
  const { loadNotes } = useNoteStore();
  const { tags, loadTags, createTag, deleteTag } = useTagStore();
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleWorkspaceClick = async (workspaceId: WorkspaceId | null) => {
    setActiveWorkspace(workspaceId);
    await loadNotes(workspaceId ?? undefined);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName.trim(), newTagColor);
    setNewTagName("");
    setShowAddTag(false);
  };

  const handleDeleteTag = async (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    await deleteTag(tagId);
  };

  return (
    <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* 工作区头部 */}
      <div className="sidebar-header">
        <div className="workspace-brand">
          <div className="workspace-icon" title="我的笔记">📝</div>
          <span className="workspace-name">我的笔记</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} title="折叠侧边栏">
          {sidebarCollapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* 搜索框（折叠时只显示图标） */}
      <div className="sidebar-search">
        <button
          className="sidebar-search-btn"
          onClick={openSearch}
          title="搜索 (Ctrl+K)"
        >
          <span className="nav-item-icon">🔍</span>
          <span className="nav-item-text">搜索... (Ctrl+K)</span>
        </button>
      </div>

      {/* 导航区域 */}
      <nav className="sidebar-nav">
        {/* 快捷访问分区 */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-section-label">快捷访问</span>
          </div>
          <button
            className={`nav-item ${activeWorkspaceId === null ? "active" : ""}`}
            onClick={() => handleWorkspaceClick(null)}
            title="全部笔记"
          >
            <span className="nav-item-icon">📚</span>
            <span className="nav-item-text">全部笔记</span>
          </button>
          {PRESET_WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              className={`nav-item ${activeWorkspaceId === ws.id ? "active" : ""}`}
              onClick={() => handleWorkspaceClick(ws.id)}
              title={ws.name}
            >
              <span className="nav-item-icon">{ws.icon}</span>
              <span className="nav-item-text">{ws.name}</span>
            </button>
          ))}
        </div>

        {/* 标签分区 */}
        <div className="nav-section">
          <div className="nav-section-title">
            <span className="nav-section-label">标签</span>
            <button
              className="nav-section-add"
              onClick={() => setShowAddTag(!showAddTag)}
              title="添加标签"
            >
              +
            </button>
          </div>

          {/* 添加标签表单 */}
          {showAddTag && !sidebarCollapsed && (
            <div className="tag-add-form">
              <input
                type="text"
                className="tag-add-input"
                placeholder="标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                autoFocus
              />
              <div className="tag-color-picker">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`tag-color-btn ${newTagColor === color ? "active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
              <div className="tag-add-actions">
                <button className="tag-add-confirm" onClick={handleCreateTag}>确定</button>
                <button className="tag-add-cancel" onClick={() => setShowAddTag(false)}>取消</button>
              </div>
            </div>
          )}

          {showAddTag && sidebarCollapsed && (
            <div className="tag-add-collapsed-hint">展开侧边栏以添加标签</div>
          )}

          {/* 标签列表 */}
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`nav-item ${activeWorkspaceId === `tag:${tag.id}` ? "active" : ""}`}
              onClick={() => handleWorkspaceClick(`tag:${tag.id}`)}
              title={`# ${tag.name}`}
            >
              <span className="nav-item-icon" style={{ color: tag.color }}>●</span>
              <span className="nav-item-text"># {tag.name}</span>
              <span
                className="nav-item-delete"
                onClick={(e) => handleDeleteTag(e, tag.id)}
                title="删除标签"
              >
                ×
              </span>
            </button>
          ))}

          {tags.length === 0 && !showAddTag && (
            <div className="tag-empty">
              <span className="nav-item-text">暂无标签</span>
            </div>
          )}
        </div>
      </nav>

      {/* 底部设置入口 */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={openSettings} title="设置">
          <span className="nav-item-icon">⚙️</span>
          <span className="nav-item-text">设置</span>
        </button>
      </div>
    </div>
  );
}

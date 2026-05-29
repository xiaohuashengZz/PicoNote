/**
 * 编辑器面板组件
 *
 * @description 编辑器主面板
 * 包含工具栏、Tiptap 编辑器和元信息栏
 *
 * @module EditorPanel
 */
import { useNoteStore } from "../../stores/noteStore";
import { useAutoSave } from "../../hooks/useAutoSave";
import TiptapEditor from "../Editor/TiptapEditor";
import "./EditorPanel.css";

/**
 * 编辑器面板组件
 */
export default function EditorPanel() {
  const { currentNote, updateNote, setCurrentNoteTitle, setCurrentNoteContent } =
    useNoteStore();

  // 自动保存：当内容变化时，自动保存到后端
  useAutoSave(
    currentNote?.id ?? null,
    currentNote?.content ?? "",
    (id, content) => updateNote(id, { content }),
    { delay: 500 }
  );

  /**
   * 处理标题变化
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setCurrentNoteTitle(newTitle);
  };

  /**
   * 处理标题失焦保存
   */
  const handleTitleBlur = () => {
    if (currentNote) {
      updateNote(currentNote.id, { title: currentNote.title });
    }
  };

  /**
   * 处理内容变化
   */
  const handleContentChange = (content: string) => {
    setCurrentNoteContent(content);
  };

  /**
   * 处理内容保存
   */
  const handleContentSave = () => {
    if (currentNote) {
      updateNote(currentNote.id, {
        content: currentNote.content,
      });
    }
  };

  /**
   * 切换收藏状态
   */
  const handleToggleFavorite = () => {
    if (currentNote) {
      updateNote(currentNote.id, { is_favorite: !currentNote.is_favorite });
    }
  };

  /**
   * 切换置顶状态
   */
  const handleTogglePinned = () => {
    if (currentNote) {
      updateNote(currentNote.id, { is_pinned: !currentNote.is_pinned });
    }
  };

  // 没有选中笔记时显示空状态
  if (!currentNote) {
    return (
      <div className="editor-panel empty">
        <div className="editor-empty">
          <div className="editor-empty-icon">📝</div>
          <p>选择一篇笔记开始编辑</p>
          <p className="editor-empty-hint">或按 Ctrl+N 创建新笔记</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-panel">
      {/* 编辑器头部 */}
      <div className="editor-header">
        <div className="editor-breadcrumb">
          <span>我的笔记</span> › <span>{currentNote.title || "无标题"}</span>
        </div>
        <div className="editor-actions">
          <button
            className={`editor-action-btn ${currentNote.is_favorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            title={currentNote.is_favorite ? "取消收藏" : "收藏"}
          >
            {currentNote.is_favorite ? "⭐" : "☆"}
          </button>
          <button
            className={`editor-action-btn ${currentNote.is_pinned ? "active" : ""}`}
            onClick={handleTogglePinned}
            title={currentNote.is_pinned ? "取消置顶" : "置顶"}
          >
            {currentNote.is_pinned ? "📌" : "📍"}
          </button>
          <button className="editor-action-btn" title="更多">
            •••
          </button>
        </div>
      </div>

      {/* 标题输入框 */}
      <div className="editor-title-container">
        <input
          type="text"
          className="editor-title"
          value={currentNote.title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="无标题"
        />
      </div>

      {/* Tiptap 编辑器 */}
      <div className="editor-content">
        <TiptapEditor
          content={currentNote.content}
          onChange={handleContentChange}
          onSave={handleContentSave}
        />
      </div>

      {/* 底部状态栏 */}
      <div className="editor-footer">
        <span className="editor-status">
          {currentNote.updated_at
            ? `最后保存: ${new Date(currentNote.updated_at).toLocaleString()}`
            : "未保存"}
        </span>
      </div>
    </div>
  );
}
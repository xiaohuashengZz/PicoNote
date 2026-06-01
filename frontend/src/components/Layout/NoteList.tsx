/**
 * 笔记列表组件
 *
 * @description 显示笔记列表
 * 支持选择笔记、新建笔记、删除笔记
 *
 * @module NoteList
 */
import { useEffect } from "react";
import { useNoteStore } from "../../stores/noteStore";
import "./NoteList.css";

/**
 * 格式化时间显示
 *
 * @description 将时间戳转换为友好格式
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化的时间字符串
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 今天：显示时间
    return `今天 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
};

/**
 * 从 Tiptap JSON 内容中提取纯文本预览
 */
const extractPreview = (content: string, maxLength: number = 50): string => {
  try {
    const doc = JSON.parse(content);
    const texts: string[] = [];

    const extractText = (node: any) => {
      if (node.text) {
        texts.push(node.text);
      }
      if (node.content) {
        node.content.forEach(extractText);
      }
    };

    if (doc.content) {
      doc.content.forEach(extractText);
    }

    const text = texts.join(" ").trim();
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  } catch {
    return "";
  }
};

/**
 * 笔记列表组件
 */
export default function NoteList() {
  const {
    notes,
    currentNoteId,
    isLoading,
    error,
    selectNote,
    createNote,
    deleteNote,
    loadNotes,
  } = useNoteStore();

  // 初始加载笔记列表
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /**
   * 处理创建新笔记
   */
  const handleCreateNote = async () => {
    await createNote("新笔记");
  };

  /**
   * 处理选择笔记
   */
  const handleSelectNote = (id: string) => {
    selectNote(id);
  };

  /**
   * 处理删除笔记
   */
  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("确定要删除这篇笔记吗？")) {
      await deleteNote(id);
    }
  };

  return (
    <div className="note-list">
      {/* 列表头部 */}
      <div className="note-list-header">
        <span className="note-list-title">全部笔记</span>
        <button
          className="note-list-create"
          onClick={handleCreateNote}
          title="新建笔记"
          disabled={isLoading}
        >
          +
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="note-list-error" style={{ padding: "8px 14px", fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
          {error}
        </div>
      )}

      {/* 笔记列表 */}
      <div className="note-list-content">
        {isLoading ? (
          <div className="note-list-loading">加载中...</div>
        ) : notes.length === 0 ? (
          <div className="note-list-empty">
            <p>暂无笔记</p>
            <button onClick={handleCreateNote}>创建第一篇笔记</button>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${currentNoteId === note.id ? "active" : ""}`}
              onClick={() => handleSelectNote(note.id)}
            >
              <div className="note-item-header">
                <span className="note-item-title">
                  {note.is_favorite && "⭐ "}
                  {note.title || "无标题"}
                </span>
                <button
                  className="note-item-delete"
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  title="删除"
                >
                  ×
                </button>
              </div>
              <div className="note-item-preview">
                {extractPreview(note.content)}
              </div>
              <div className="note-item-meta">
                {note.is_pinned && (
                  <span className="note-tag pinned">置顶</span>
                )}
                <span className="note-time">{formatTime(note.updated_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNoteStore } from "../../stores/noteStore";
import { useTagStore } from "../../stores/tagStore";
import { useAutoSave } from "../../hooks/useAutoSave";
import { noteApi } from "../../lib/tauri";
import TiptapEditor from "../Editor/TiptapEditor";
import type { Tag } from "../../types/tag";
import "./EditorPanel.css";

export default function EditorPanel() {
  const { currentNote, updateNote, setCurrentNoteTitle, setCurrentNoteContent, createNote } =
    useNoteStore();
  const { tags, loadTags } = useTagStore();
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [showTagPicker, setShowTagPicker] = useState(false);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    if (currentNote?.id) {
      noteApi.getTags(currentNote.id).then(setNoteTags).catch(() => setNoteTags([]));
    } else {
      setNoteTags([]);
    }
    setShowTagPicker(false);
  }, [currentNote?.id]);

  useAutoSave(
    currentNote?.id ?? null,
    currentNote?.content ?? "",
    (id, content) => updateNote(id, { content }),
    { delay: 500 }
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNoteTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (currentNote) {
      updateNote(currentNote.id, { title: currentNote.title });
    }
  };

  const handleContentChange = (content: string) => {
    setCurrentNoteContent(content);
  };

  const handleContentSave = () => {
    if (currentNote) {
      updateNote(currentNote.id, { content: currentNote.content });
    }
  };

  const handleToggleFavorite = () => {
    if (currentNote) {
      updateNote(currentNote.id, { is_favorite: !currentNote.is_favorite });
    }
  };

  const handleTogglePinned = () => {
    if (currentNote) {
      updateNote(currentNote.id, { is_pinned: !currentNote.is_pinned });
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    if (!currentNote) return;
    const isAttached = noteTags.some((t) => t.id === tag.id);
    const newTagIds = isAttached
      ? noteTags.filter((t) => t.id !== tag.id).map((t) => t.id)
      : [...noteTags.map((t) => t.id), tag.id];
    try {
      await noteApi.setTags(currentNote.id, newTagIds);
      setNoteTags(isAttached ? noteTags.filter((t) => t.id !== tag.id) : [...noteTags, tag]);
      if (!isAttached) {
        setShowTagPicker(false);
      }
    } catch (e) {
      console.error("Failed to set note tags:", e);
    }
  };

  if (!currentNote) {
    return (
      <div className="editor-panel empty">
        <div className="editor-empty">
          <div className="editor-empty-icon">📝</div>
          <p>选择一篇笔记开始编辑</p>
          <button
            className="editor-create-btn"
            onClick={async () => await createNote("新笔记")}
          >
            + 新建笔记
          </button>
          <p className="editor-empty-hint">或按 Ctrl+N 创建新笔记</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-panel">
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
        </div>
      </div>

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

      <div className="editor-tags-bar">
        {noteTags.map((tag) => (
          <span key={tag.id} className="editor-tag" style={{ borderColor: tag.color }}>
            <span className="editor-tag-dot" style={{ background: tag.color }} />
            {tag.name}
            <button className="editor-tag-remove" onClick={() => handleToggleTag(tag)}>
              ×
            </button>
          </span>
        ))}
        <button
          className="editor-tag-add"
          onClick={() => setShowTagPicker(!showTagPicker)}
        >
          + 标签
        </button>
      </div>

      {showTagPicker && (
        <div className="tag-picker-inline">
          {tags.length === 0 ? (
            <div className="tag-picker-empty">暂无标签，请先在侧边栏创建</div>
          ) : (
            tags.map((tag) => {
              const isSelected = noteTags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  className={`tag-picker-item ${isSelected ? "active" : ""}`}
                  onClick={() => handleToggleTag(tag)}
                >
                  <span className="tag-picker-dot" style={{ background: tag.color }} />
                  {tag.name}
                  {isSelected && <span className="tag-picker-check">✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}

      <div className="editor-content">
        <TiptapEditor
          content={currentNote.content}
          onChange={handleContentChange}
          onSave={handleContentSave}
        />
      </div>

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

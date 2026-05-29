/**
 * 全局搜索组件
 *
 * @description 全局搜索弹窗，支持 Ctrl+K 打开
 * 提供即时的全文搜索功能
 *
 * @module GlobalSearch
 */
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useSearchStore } from "../../stores/searchStore";
import { useNoteStore } from "../../stores/noteStore";
import { useDebounce } from "../../hooks/useDebounce";
import "./GlobalSearch.css";

/**
 * 全局搜索组件
 */
export default function GlobalSearch() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const { results, isSearching, search, clearResults } =
    useSearchStore();
  const { selectNote } = useNoteStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState("");

  // 防抖搜索
  const [debouncedQuery] = useDebounce(localQuery, 300);

  // 执行搜索
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery, search]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isSearchOpen) {
      setLocalQuery("");
      clearResults();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen, clearResults]);

  // 点击结果项
  const handleSelectResult = (noteId: string) => {
    selectNote(noteId);
    closeSearch();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeSearch();
    }
  };

  // 未打开时不渲染
  if (!isSearchOpen) {
    return null;
  }

  return (
    <div className="global-search-overlay" onClick={closeSearch}>
      <div
        className="global-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索笔记..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="search-shortcut">Ctrl+K</span>
        </div>

        {/* 搜索结果 */}
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">搜索中...</div>
          ) : results.length === 0 && localQuery ? (
            <div className="search-empty">
              <p>没有找到匹配的笔记</p>
              <p className="search-empty-hint">尝试其他关键词</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.note_id}
                className="search-result-item"
                onClick={() => handleSelectResult(result.note_id)}
              >
                <div className="search-result-title">{result.title}</div>
                <div
                  className="search-result-snippet"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              </div>
            ))
          ) : (
            <div className="search-hint">
              <p>输入关键词搜索笔记</p>
              <p className="search-hint-keys">
                支持标题和内容的全文搜索
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
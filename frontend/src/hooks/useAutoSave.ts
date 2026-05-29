/**
 * 自动保存 Hook
 *
 * @description 监听内容变化，自动保存到后端
 * 使用 Debounce 减少保存频率，避免频繁写入
 *
 * @module useAutoSave
 */
import { useEffect, useRef } from "react";
import { useDebounce } from "./useDebounce";

/**
 * 自动保存 Hook 配置
 */
interface UseAutoSaveOptions {
  /** 防抖延迟时间（毫秒），默认 500 */
  delay?: number;
}

/**
 * 自动保存 Hook
 *
 * @description 当 content 变化时，自动调用 save 函数
 * 使用防抖确保不会过于频繁地保存
 *
 * @param noteId - 笔记 ID（null 表示不保存）
 * @param content - 笔记内容
 * @param onSave - 保存回调函数
 * @param options - 配置选项
 *
 * @example
 * useAutoSave(
 *   currentNoteId,
 *   content,
 *   (id, content) => updateNote(id, { content }),
 *   { delay: 500 }
 * );
 */
export function useAutoSave(
  noteId: string | null,
  content: string,
  onSave: (id: string, content: string) => void,
  options: UseAutoSaveOptions = {}
) {
  const { delay = 500 } = options;

  // 记录上一次保存的内容，避免重复保存
  const lastSavedRef = useRef<string>("");

  // 防抖后的内容
  const [debouncedContent] = useDebounce(content, delay);

  useEffect(() => {
    // 如果没有选中的笔记，不保存
    if (!noteId) {
      return;
    }

    // 如果内容没有变化，不保存
    if (debouncedContent === lastSavedRef.current) {
      return;
    }

    // 执行保存
    onSave(noteId, debouncedContent);
    lastSavedRef.current = debouncedContent;
  }, [noteId, debouncedContent, onSave]);
}
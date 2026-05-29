/**
 * 键盘快捷键 Hook
 *
 * @description 监听全局键盘快捷键
 * 支持 Ctrl/Cmd + K 打开搜索等
 *
 * @module useKeyboardShortcuts
 */
import { useEffect } from "react";
import { useUIStore } from "../stores/uiStore";

/**
 * 快捷键配置
 */
interface ShortcutConfig {
  /** 打开全局搜索 */
  openSearch?: string;
  /** 关闭弹窗 */
  closeModal?: string;
  /** 自定义快捷键回调 */
  onSave?: () => void;
}

/**
 * 键盘快捷键 Hook
 *
 * @description 注册全局键盘快捷键
 *
 * @param config - 快捷键配置
 *
 * @example
 * useKeyboardShortcuts({
 *   openSearch: "ctrl+k",
 *   closeModal: "escape",
 * });
 */
export function useKeyboardShortcuts(config: ShortcutConfig = {}) {
  const { toggleSearch, closeSearch } = useUIStore();

  useEffect(() => {
    /**
     * 处理键盘事件
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的快捷键（除非是 Esc）
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl/Cmd + K：打开全局搜索
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "k" &&
        config.openSearch
      ) {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Escape：关闭弹窗
      if (e.key === "Escape" && isInput) {
        closeSearch();
        return;
      }

      // 如果焦点在输入框中，不再处理其他快捷键
      if (isInput) {
        return;
      }

      // Ctrl/Cmd + N：新建笔记（可以扩展）
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        // 可以触发创建笔记事件
        return;
      }

      // Ctrl/Cmd + S：保存
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        config.onSave?.();
        return;
      }
    };

    // 添加事件监听器
    window.addEventListener("keydown", handleKeyDown);

    // 清理函数
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSearch, closeSearch, config.onSave]);
}
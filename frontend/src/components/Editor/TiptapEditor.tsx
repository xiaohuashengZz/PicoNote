/**
 * Tiptap 富文本编辑器组件
 *
 * @description 基于 Tiptap 的富文本编辑器
 * 支持标题、加粗、斜体、列表、代码块、图片等
 *
 * @module TiptapEditor
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";
import "./TiptapEditor.css";

/**
 * TiptapEditor 组件属性
 */
interface TiptapEditorProps {
  /** 编辑器内容（Tiptap JSON 格式字符串） */
  content: string;
  /** 内容变化回调 */
  onChange: (content: string) => void;
  /** 保存回调（Ctrl+S） */
  onSave?: () => void;
}

/**
 * Tiptap 富文本编辑器组件
 *
 * @description 基于 Tiptap 的富文本编辑器组件
 * 集成常用扩展：标题、加粗、斜体、下划线、列表、代码块、图片、任务列表等
 */
export default function TiptapEditor({
  content,
  onChange,
  onSave,
}: TiptapEditorProps) {
  /**
   * 初始化 Tiptap 编辑器
   */
  const editor = useEditor({
    extensions: [
      // 基础扩展
      StarterKit.configure({
        // 配置标题级别
        heading: {
          levels: [1, 2, 3],
        },
        // 不使用默认的代码块，使用独立的 CodeBlock 扩展
        codeBlock: false,
      }),

      // 下划线
      Underline,

      // 占位符扩展
      Placeholder.configure({
        placeholder: "开始输入...",
      }),


      // 任务列表
      TaskList,
      TaskItem.configure({
        nested: true,
      }),

      // 图片支持
      Image.configure({
        inline: false,
        allowBase64: true,
      }),


      // 代码块
      CodeBlock.configure({
        HTMLAttributes: {
          class: "code-block",
        },
      }),

      // 链接支持
      Link.configure({
        openOnClick: false, // 禁用默认点击打开，我们用 Ctrl+点击
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: parseContent(content),


    // 内容变化时触发回调
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      onChange(json);
    },


    // 编辑器属性
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg focus:outline-none",
      },
      // 自定义粘贴处理：将 URL 转换为可点击链接
      handlePaste: (_view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const text = clipboard.getData("text/plain");
        if (!text) return false;

        // 检查是否为 URL（以 http:// 或 https:// 开头）
        const urlPattern = /^https?:\/\/[^\s]+$/i;
        if (urlPattern.test(text.trim())) {
          // 使用编辑器命令插入链接
          const url = text.trim();
          editor?.chain().focus().insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`).run();
          return true;
        }

        return false;
      },
    },
  });

  /**
   * 解析内容字符串为 Tiptap 文档
   */
  function parseContent(contentStr: string): any {
    try {
      if (contentStr) {
        return JSON.parse(contentStr);
      }
    } catch (e) {
      console.warn("Failed to parse content:", e);
    }
    // 返回空文档
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  /**
   * 键盘快捷键处理和链接点击处理
   */
  useEffect(() => {
    if (!editor) return;


    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };

    // Ctrl+点击链接打开
    const editorElement = editor.view.dom;
    const handleClick = (e: MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const target = e.target as HTMLElement;
        const link = target.closest("a");
        if (link && link.href) {
          e.preventDefault();
          window.open(link.href, "_blank");
        }
      }
    };

    editorElement.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      editorElement.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, onSave]);

  /**
   * 当外部 content 变化时更新编辑器
   */
  useEffect(() => {
    if (!editor) return;

    const currentContent = JSON.stringify(editor.getJSON());
    if (content !== currentContent) {
      const parsed = parseContent(content);
      editor.commands.setContent(parsed);
    }
  }, [content, editor]);

  /**
   * 添加图片
   */
  const addImage = useCallback(() => {
    const url = window.prompt("输入图片地址:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {/* 工具栏 */}
      <div className="editor-toolbar">
        {/* 格式按钮组 */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="加粗 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜体 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("underline") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="下划线 (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-divider" />


        {/* 标题按钮组 */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="标题 1"
          >
            H1
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="标题 2"
          >
            H2
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="标题 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* 列表按钮组 */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="无序列表"
          >
            •
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="有序列表"
          >
            1.
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("taskList") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="任务列表"
          >
            ☑
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* 代码和引用 */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${editor.isActive("codeBlock") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="代码块"
          >
            {"</>"}
          </button>
          <button
            className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
          >
            "
          </button>
        </div>

        <div className="toolbar-divider" />


        {/* 图片 */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={addImage}
            title="插入图片"
          >
            📷
          </button>
        </div>

        <div className="toolbar-divider" />


        {/* 撤销和重做 */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销 (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            className="toolbar-btn"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做 (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <EditorContent editor={editor} className="editor-content-wrapper" />
    </div>
  );
}
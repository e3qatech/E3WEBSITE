"use client"

import React, { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2
} from "lucide-react"

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  dir?: "ltr" | "rtl"
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border-default)] bg-[var(--surface-hover)]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("bold") ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("italic") ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <div className="w-px h-4 bg-[var(--border-default)] mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Heading 2"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Heading 3"
      >
        <Heading2 size={16} />
      </button>

      <div className="w-px h-4 bg-[var(--border-default)] mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("bulletList") ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("orderedList") ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-[var(--surface-active)] transition-colors ${editor.isActive("blockquote") ? "bg-[var(--surface-active)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`}
        type="button"
        title="Quote"
      >
        <Quote size={16} />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-[var(--surface-active)] text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        type="button"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-[var(--surface-active)] text-[var(--text-secondary)] transition-colors disabled:opacity-50"
        type="button"
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  )
}

export function TipTapEditor({ value, onChange, placeholder, dir = "ltr" }: TipTapEditorProps) {
  // We need to manage mounting to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none ${dir === 'rtl' ? 'text-right' : 'text-left'}`,
        dir: dir
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Synchronize external value changes if needed (e.g. language toggle)
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--surface-default)] min-h-[240px] flex items-center justify-center text-[var(--text-tertiary)]">
        Loading editor...
      </div>
    )
  }

  return (
    <div className={`border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--surface-default)] focus-within:border-[var(--color-primary)] transition-colors`}>
      <MenuBar editor={editor} />
      <div className={`custom-scrollbar overflow-y-auto max-h-[500px]`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

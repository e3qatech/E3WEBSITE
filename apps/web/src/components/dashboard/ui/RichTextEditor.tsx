"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2 
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  dir?: "ltr" | "rtl"
}

export function RichTextEditor({ value, onChange, dir = "ltr" }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className={`border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--surface-default)] ${dir === 'rtl' ? 'text-end' : 'text-start'}`} dir={dir}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border-default)] bg-[var(--surface-hover)]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive("bold") ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive("italic") ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded ${editor.isActive("link") ? "bg-[var(--color-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[200px] prose prose-sm max-w-none focus:outline-none dark:prose-invert">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

"use client"

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Bold, Italic, Strikethrough, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Code, Heading1, Heading2, Heading3 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DiaryEditorProps {
  initialTitle?: string
  initialContent?: string
  onSubmit: (title: string, content: string) => void
  onCancel: () => void
}

export function DiaryEditor({ initialContent = '', onSubmit, onCancel }: DiaryEditorProps) {
  const defaultContent = initialContent || '<h1>100天重新出发 | 复盘日课: 33天/100天</h1><p>开始写作...</p>'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.attrs.level === 1) {
            return '标题'
          }
          return '开始写作...'
        },
      }),
    ],
    content: defaultContent,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none px-4 py-4',
          // 调整行间距
          'prose-p:my-1 prose-headings:my-2',
          // 设置正文字号为 15px
          'prose-p:text-[15px] prose-p:leading-relaxed',
          // 调整标题样式
          'prose-h1:text-2xl prose-h1:font-semibold prose-h1:leading-normal',
          'prose-h2:text-xl prose-h2:font-semibold prose-h2:leading-normal',
          'prose-h3:text-lg prose-h3:font-semibold prose-h3:leading-normal',
          // 调整列表样式
          'prose-ul:my-1 prose-ol:my-1',
          'prose-li:my-0.5',
          // 调整引用样式
          'prose-blockquote:my-2',
          // 调整代码块样式
          'prose-pre:my-2',
        ),
      },
    },
  })

  const extractTitle = (content: string) => {
    const div = document.createElement('div')
    div.innerHTML = content
    const h1 = div.querySelector('h1')
    return h1?.textContent || '无标题'
  }

  const handleSubmit = () => {
    if (!editor) return
    const content = editor.getHTML()
    const title = extractTitle(content)
    onSubmit(title, content)
  }

  if (!editor) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* 工具栏 */}
      <div className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary bg-primary/10 hover:bg-primary/20"
              onClick={onCancel}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              data-active={editor.isActive('bold')}
              className="data-[active=true]:bg-accent"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              data-active={editor.isActive('italic')}
              className="data-[active=true]:bg-accent"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              data-active={editor.isActive('strike')}
              className="data-[active=true]:bg-accent"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              data-active={editor.isActive('heading', { level: 1 })}
              className="data-[active=true]:bg-accent"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              data-active={editor.isActive('heading', { level: 2 })}
              className="data-[active=true]:bg-accent"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              data-active={editor.isActive('heading', { level: 3 })}
              className="data-[active=true]:bg-accent"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              data-active={editor.isActive('bulletList')}
              className="data-[active=true]:bg-accent"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              data-active={editor.isActive('orderedList')}
              className="data-[active=true]:bg-accent"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              data-active={editor.isActive('blockquote')}
              className="data-[active=true]:bg-accent"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt('输入链接地址:')
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run()
                }
              }}
              data-active={editor.isActive('link')}
              className="data-[active=true]:bg-accent"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt('输入图片地址:')
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run()
                }
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              data-active={editor.isActive('codeBlock')}
              className="data-[active=true]:bg-accent"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="h-[calc(100vh-3.5rem)] overflow-auto">
        <EditorContent editor={editor} />
      </div>

      {/* 提交按钮 */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button 
          size="icon"
          onClick={handleSubmit} 
          className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur hover:bg-primary/90"
        >
          <Check className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
} 
"use client"

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ArrowLeft, Plus, Type, Tag, Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  List, ListOrdered, ListTodo, Quote, Image as ImageIcon, Table as TableIcon, Code, 
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, SeparatorHorizontal, Paperclip, Palette } from 'lucide-react'
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      HorizontalRule,
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

          {/* 插入按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                const url = window.prompt('输入图片地址:')
                if (url) editor.chain().focus().setImage({ src: url }).run()
              }}>
                <ImageIcon className="h-4 w-4 mr-2" />
                <span>图片</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const url = window.prompt('输入附件地址:')
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }}>
                <Paperclip className="h-4 w-4 mr-2" />
                <span>附件</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                <TableIcon className="h-4 w-4 mr-2" />
                <span>表格</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHighlight().run()}>
                <Highlighter className="h-4 w-4 mr-2" />
                <span>高亮块</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4 mr-2" />
                <span>引用</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <SeparatorHorizontal className="h-4 w-4 mr-2" />
                <span>分割线</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <Code className="h-4 w-4 mr-2" />
                <span>代码块</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 文本样式按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                <span>标题 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                <span>标题 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                <span>标题 3</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold className="h-4 w-4 mr-2" />
                <span>加粗</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic className="h-4 w-4 mr-2" />
                <span>斜体</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon className="h-4 w-4 mr-2" />
                <span>下划线</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough className="h-4 w-4 mr-2" />
                <span>删除线</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List className="h-4 w-4 mr-2" />
                <span>无序列表</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4 mr-2" />
                <span>有序列表</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()}>
                <ListTodo className="h-4 w-4 mr-2" />
                <span>任务列表</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                <AlignLeft className="h-4 w-4 mr-2" />
                <span>左对齐</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                <AlignCenter className="h-4 w-4 mr-2" />
                <span>居中对齐</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                <AlignRight className="h-4 w-4 mr-2" />
                <span>右对齐</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                <AlignJustify className="h-4 w-4 mr-2" />
                <span>两端对齐</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const color = window.prompt('输入颜色值 (例如: #000000):')
                if (color) editor.chain().focus().setColor(color).run()
              }}>
                <Palette className="h-4 w-4 mr-2" />
                <span>文字颜色</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 标签按钮 */}
          <Button variant="ghost" size="sm" className="gap-1">
            <Tag className="h-4 w-4" />
          </Button>
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
"use client"

import React, { useState } from 'react'
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
  Highlighter, SeparatorHorizontal, Paperclip, Palette, IndentIcon, Outdent, Link as LinkIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Indent } from './extensions/indent'

interface DiaryEditorProps {
  initialTitle?: string
  initialContent?: string
  initialCategory?: string
  onSubmit: (title: string, content: string, category: string, tags: string[]) => void
  onCancel: () => void
}

export function DiaryEditor({ initialTitle = '', initialContent = '', initialCategory = '复盘', onSubmit, onCancel }: DiaryEditorProps) {
  const [title, setTitle] = useState(initialTitle || '')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [category, setCategory] = useState<string>(initialCategory) // 使用传入的初始分类或默认为'复盘'
  
  // 从内容中提取标签
  React.useEffect(() => {
    if (initialContent) {
      const matches = initialContent.match(/#[^\s#<>]+/g) || [];
      if (matches.length > 0) {
        setTags(matches.map(tag => tag.substring(1))); // 移除#符号
      }
    }
  }, [initialContent]);

  const defaultContent = initialContent || ''

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
      Indent.configure({
        types: ['paragraph', 'heading', 'listItem', 'taskItem'],
        minIndent: 0,
        maxIndent: 7,
      }),
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
          'editor-content'
        ),
      },
    },
  })

  const addTag = (text: string) => {
    if (!text) return;
    
    // 如果标签不以#开头，添加#
    const tagText = text.startsWith('#') ? text.substring(1) : text;
    
    // 检查标签是否已存在
    if (!tags.includes(tagText)) {
      setTags([...tags, tagText]);
    }
    
    setTagInput('');
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  // 添加一个函数来处理点击添加标签
  const handleAddTagClick = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  }

  const handleSubmit = () => {
    if (!editor) return;
    
    // 保存HTML内容以保留格式和样式
    let htmlContent = editor.getHTML();
    
    // 传递标题、HTML内容、分类和标签到父组件
    onSubmit(title || '无标题', htmlContent, category, tags);
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__menu">
          <button 
            className="btn-icon" 
            aria-label="返回"
            onClick={onCancel}
          >
            <ArrowLeft className="icon" />
          </button>
        </div>
        <div className="header__logo" style={{ color: "white" }}>ETHOSLOG</div>
        <div className="header__actions">
          {/* 删除这里的保存按钮 */}
        </div>
      </header>

      <div className="content-wrapper">
        <main className="main">
          <section className="content-create">
            <div className="integrated-editor">
              <div className="editor-toolbar">
                <button className="toolbar-btn" title="加粗" onClick={() => editor.chain().focus().toggleBold().run()}>
                  <Bold className="icon bold-icon" />
                </button>
                <button className="toolbar-btn" title="斜体" onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <Italic className="icon" />
                </button>
                <button className="toolbar-btn" title="下划线" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                  <UnderlineIcon className="icon underline-icon" />
                </button>
                <button className="toolbar-btn" title="删除线" onClick={() => editor.chain().focus().toggleStrike().run()}>
                  <Strikethrough className="icon strikethrough-icon" />
                </button>
                <button className="toolbar-btn" title="标题1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                  <Heading1 className="icon" />
                </button>
                <button className="toolbar-btn" title="标题2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                  <Heading2 className="icon" />
                </button>
                <button className="toolbar-btn" title="无序列表" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                  <List className="icon" />
                </button>
                <button className="toolbar-btn" title="有序列表" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                  <ListOrdered className="icon" />
                </button>
                <button className="toolbar-btn" title="任务列表" onClick={() => editor.chain().focus().toggleTaskList().run()}>
                  <ListTodo className="icon" />
                </button>
                <button className="toolbar-btn" title="引用" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                  <Quote className="icon quote-icon" />
                </button>
                <button className="toolbar-btn" title="链接" onClick={() => {
                  const url = window.prompt('输入链接地址:')
                  if (url) editor.chain().focus().setLink({ href: url }).run()
                }}>
                  <LinkIcon className="icon link-icon" />
                </button>
                <button className="toolbar-btn" title="图片" onClick={() => {
                  const url = window.prompt('输入图片地址:')
                  if (url) editor.chain().focus().setImage({ src: url }).run()
                }}>
                  <ImageIcon className="icon image-icon" />
                </button>
                <button className="toolbar-btn" title="表格" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                  <TableIcon className="icon table-icon" />
                </button>
                <button className="toolbar-btn" title="左对齐" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                  <AlignLeft className="icon" />
                </button>
                <button className="toolbar-btn" title="居中对齐" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                  <AlignCenter className="icon" />
                </button>
                <button className="toolbar-btn" title="右对齐" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                  <AlignRight className="icon" />
                </button>
                <button className="toolbar-btn" title="增加缩进" onClick={() => editor.chain().focus().indent().run()}>
                  <IndentIcon className="icon" />
                </button>
                <button className="toolbar-btn" title="减少缩进" onClick={() => editor.chain().focus().outdent().run()}>
                  <Outdent className="icon" />
                </button>
              </div>

              <div className="editor-container">
                <input 
                  type="text" 
                  className="editor-title" 
                  placeholder="输入标题..." 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
                />
                <div className="editor-tags">
                  {tags.map((tag, index) => (
                    <span className="tag" key={index}>
                      #{tag}<span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    placeholder="添加标签..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={() => tagInput.trim() && addTag(tagInput)}
                  />
                </div>
                <div className="editor-content-wrapper">
                  <EditorContent 
                    editor={editor} 
                    className="editor-content-area"
        />
      </div>
              </div>
            </div>

            <div className="editor-footer">
              <div className="footer-left">
                <div className="category-selector">
                  <span className="category-label">分类：</span>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="category"
                        value="复盘"
                        checked={category === '复盘'}
                        onChange={(e) => setCategory(e.target.value)}
                        className="radio-input"
                      />
                      <span className="radio-text">复盘</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="category"
                        value="知识"
                        checked={category === '知识'}
                        onChange={(e) => setCategory(e.target.value)}
                        className="radio-input"
                      />
                      <span className="radio-text">知识</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="category"
                        value="灵感"
                        checked={category === '灵感'}
                        onChange={(e) => setCategory(e.target.value)}
                        className="radio-input"
                      />
                      <span className="radio-text">灵感</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="footer-right">
                <button className="btn btn-secondary" onClick={onCancel}>取消</button>
                <button className="btn btn-primary" onClick={handleSubmit}>保存</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
} 
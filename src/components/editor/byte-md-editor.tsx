"use client"

import React, { useState, useEffect } from 'react'
import { Editor } from '@bytemd/react'
import 'bytemd/dist/index.css'
import 'github-markdown-css'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mermaid from '@bytemd/plugin-mermaid'
import gemoji from '@bytemd/plugin-gemoji'
import { ArrowLeft } from 'lucide-react'
import rehypeSanitize from 'rehype-sanitize'

// 定义中文本地化
const zhHans: any = {
  toolbar: {
    write: '编辑',
    preview: '预览',
    writePreview: '编辑/预览',
    help: '帮助',
    bold: '加粗',
    italic: '斜体',
    strikethrough: '删除线',
    code: '代码',
    codeBlock: '代码块',
    quote: '引用',
    heading: '标题',
    link: '链接',
    image: '图片',
    table: '表格',
    orderedList: '有序列表',
    unorderedList: '无序列表',
    taskList: '任务列表',
    indent: '增加缩进',
    outdent: '减少缩进',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    close: '关闭',
    save: '保存'
  }
}

// 定义编辑器属性接口
interface ByteMDEditorProps {
  initialTitle?: string
  initialContent?: string
  initialCategory?: string
  initialTags?: string[]
  onSubmit: (title: string, content: string, category: string, tags: string[]) => void
  onCancel: () => void
}

export function ByteMDEditor({
  initialTitle = '',
  initialContent = '',
  initialCategory = '复盘',
  initialTags = [],
  onSubmit,
  onCancel
}: ByteMDEditorProps) {
  // 状态管理
  const [title, setTitle] = useState(initialTitle || '')
  const [content, setContent] = useState(initialContent || '')
  const [tags, setTags] = useState<string[]>(initialTags || [])
  const [tagInput, setTagInput] = useState('')
  const [category, setCategory] = useState<string>(initialCategory)

  // 编辑器插件
  const plugins = [
    gfm(),
    highlight(),
    math(),
    mermaid(),
    gemoji()
  ]

  // 标签处理函数
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

  const handleAddTagClick = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
    }
  }

  // 提交处理函数
  const handleSubmit = () => {
    onSubmit(title || '无标题', content, category, tags);
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
        <div className="bytemd-toolbar">
          {/* ByteMD工具栏会自动渲染在这里 */}
        </div>
      </header>

      <div className="content-wrapper">
        <main className="main">
          <section className="content-create">
            <div className="integrated-editor">
              <div className="editor-container">
                <input
                  type="text"
                  className="editor-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入标题..."
                />
                <div className="editor-tags">
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <span className="tag" key={index}>
                        #{tag}<span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      placeholder="添加标签..." 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={() => tagInput.trim() && addTag(tagInput)}
                    />
                    {tagInput && (
                      <span className="tag-add-btn" onClick={handleAddTagClick}>×</span>
                    )}
                  </div>
                </div>
                
                <Editor
                  value={content}
                  onChange={(v) => {
                    setContent(v);
                  }}
                  plugins={plugins}
                  uploadImages={async (files: File[]) => {
                    // 这里应该实现图片上传逻辑
                    // 返回一个符合要求的数组
                    return files.map(file => ({
                      title: file.name,
                      url: URL.createObjectURL(file),
                      alt: file.name
                    }));
                  }}
                  locale={zhHans}
                />
              </div>
            </div>

            <div className="editor-footer">
              <div className="category-selector">
                <span className="category-label">分类：</span>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      className="radio-input"
                      checked={category === "复盘"}
                      onChange={() => setCategory("复盘")}
                    />
                    <span className="radio-text">复盘</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      className="radio-input"
                      checked={category === "知识"}
                      onChange={() => setCategory("知识")}
                    />
                    <span className="radio-text">知识</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      className="radio-input"
                      checked={category === "灵感"}
                      onChange={() => setCategory("灵感")}
                    />
                    <span className="radio-text">灵感</span>
                  </label>
                </div>
              </div>
              <div className="editor-actions">
                <button 
                  onClick={onCancel}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button 
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
} 
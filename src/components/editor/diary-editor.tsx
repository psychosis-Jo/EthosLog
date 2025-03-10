"use client"

import React from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DiaryEditorProps {
  initialTitle?: string
  initialContent?: string
  onSubmit: (title: string, content: string) => void
  onCancel: () => void
}

export function DiaryEditor({ initialContent = '', onSubmit, onCancel }: DiaryEditorProps) {
  const defaultContent = initialContent || '# 100天重新出发 | 复盘日课: 33天/100天\n\n'
  const [content, setContent] = React.useState(defaultContent)
  const extractTitle = (content: string) => {
    const lines = content.split('\n')
    return lines[0]?.replace(/^#+\s*/, '') || '无标题'
  }

  const handleSubmit = () => {
    const title = extractTitle(content)
    onSubmit(title, content)
  }

  return (
    <div className="fixed inset-0">
      {/* 浮动按钮 */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onCancel} 
          className="w-12 h-12 rounded-full bg-background/80 backdrop-blur hover:bg-background/90"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button 
          size="icon"
          onClick={handleSubmit} 
          className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur hover:bg-primary/90"
        >
          <Check className="h-6 w-6" />
        </Button>
      </div>

      {/* 编辑器区域 */}
      <MDEditor
        value={content}
        onChange={value => setContent(value || '')}
        preview="edit"
        className={cn(
          "!h-screen",
          // 移除所有边框和阴影
          "[&_.w-md-editor]:border-0",
          "[&_.w-md-editor]:shadow-none",
          // 调整工具栏样式
          "[&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-border",
          "[&_.w-md-editor-toolbar]:bg-background/80 [&_.w-md-editor-toolbar]:backdrop-blur",
          "[&_.w-md-editor-toolbar]:px-4",
          "[&_.w-md-editor-toolbar]:sticky [&_.w-md-editor-toolbar]:top-0",
          // 调整编辑区域样式
          "[&_.w-md-editor-content]:h-[calc(100vh-2.5rem)]",
          "[&_.w-md-editor-text-pre>textarea]:px-4",
          "[&_.w-md-editor-text-pre>textarea]:py-4",
          "[&_.w-md-editor-text]:bg-background",
          "[&_.w-md-editor-text-pre]:bg-background",
          "[&_.w-md-editor-text-pre>textarea]:bg-background",
          // 预览区域样式
          "[&_.wmde-markdown-var]:px-4",
          "[&_.wmde-markdown-var]:py-4",
          "[&_.w-md-editor-preview]:bg-background",
          // 确保只有一个滚动条
          "[&_.w-md-editor]:!overflow-hidden",
          "[&_.w-md-editor-content]:!overflow-auto",
          // 底部留出空间给按钮
          "[&_.w-md-editor-content]:pb-24"
        )}
      />
    </div>
  )
} 
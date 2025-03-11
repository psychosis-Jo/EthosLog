"use client"

import React from 'react'
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor'
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Bold, Italic, Strikethrough, List, ListOrdered, Quote, Link, Image, Code, Heading1, Heading2, Heading3 } from 'lucide-react'
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

  // 自定义返回按钮命令
  const backCommand: ICommand = {
    name: 'back',
    keyCommand: 'back',
    buttonProps: { 'aria-label': '返回' },
    icon: <ArrowLeft className="h-4 w-4" />,
    execute: () => {
      onCancel()
    },
  }

  // 自定义工具栏命令
  const toolbarCommands = [
    {
      groupName: '导航',
      commands: [backCommand]
    },
    {
      groupName: '文本格式',
      commands: [
        {
          ...commands.bold,
          icon: <Bold className="h-4 w-4" />
        },
        {
          ...commands.italic,
          icon: <Italic className="h-4 w-4" />
        },
        {
          ...commands.strikethrough,
          icon: <Strikethrough className="h-4 w-4" />
        }
      ]
    },
    {
      groupName: '标题',
      commands: [
        {
          ...commands.title1,
          icon: <Heading1 className="h-4 w-4" />
        },
        {
          ...commands.title2,
          icon: <Heading2 className="h-4 w-4" />
        },
        {
          ...commands.title3,
          icon: <Heading3 className="h-4 w-4" />
        }
      ]
    },
    {
      groupName: '列表',
      commands: [
        {
          ...commands.unorderedListCommand,
          icon: <List className="h-4 w-4" />
        },
        {
          ...commands.orderedListCommand,
          icon: <ListOrdered className="h-4 w-4" />
        },
        {
          ...commands.quote,
          icon: <Quote className="h-4 w-4" />
        }
      ]
    },
    {
      groupName: '插入',
      commands: [
        {
          ...commands.link,
          icon: <Link className="h-4 w-4" />
        },
        {
          ...commands.image,
          icon: <Image className="h-4 w-4" />
        },
        {
          ...commands.code,
          icon: <Code className="h-4 w-4" />
        }
      ]
    }
  ]

  return (
    <div className="fixed inset-0">
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

      {/* 编辑器区域 */}
      <MDEditor
        value={content}
        onChange={value => setContent(value || '')}
        preview="edit"
        commands={toolbarCommands.flatMap(group => group.commands)}
        className={cn(
          "!h-screen",
          // 移除所有边框和阴影
          "[&_.w-md-editor]:border-0",
          "[&_.w-md-editor]:shadow-none",
          // 调整工具栏样式
          "[&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-border",
          "[&_.w-md-editor-toolbar]:bg-background/80 [&_.w-md-editor-toolbar]:backdrop-blur",
          "[&_.w-md-editor-toolbar]:px-4 [&_.w-md-editor-toolbar]:py-2",
          "[&_.w-md-editor-toolbar]:sticky [&_.w-md-editor-toolbar]:top-0",
          "[&_.w-md-editor-toolbar]:flex [&_.w-md-editor-toolbar]:items-center [&_.w-md-editor-toolbar]:gap-4",
          // 工具栏按钮样式
          "[&_.w-md-editor-toolbar>ul]:flex [&_.w-md-editor-toolbar>ul]:items-center [&_.w-md-editor-toolbar>ul]:gap-1",
          "[&_.w-md-editor-toolbar>ul>li>button]:p-2 [&_.w-md-editor-toolbar>ul>li>button]:rounded-lg",
          "[&_.w-md-editor-toolbar>ul>li>button:hover]:bg-accent",
          "[&_.w-md-editor-toolbar>ul>li.active>button]:bg-accent",
          // 返回按钮特殊样式
          "[&_.w-md-editor-toolbar>ul:first-child>li>button]:bg-primary/10",
          "[&_.w-md-editor-toolbar>ul:first-child>li>button]:text-primary",
          "[&_.w-md-editor-toolbar>ul:first-child>li>button:hover]:bg-primary/20",
          "[&_.w-md-editor-toolbar>ul:first-child]:mr-4",
          "[&_.w-md-editor-toolbar>ul:first-child]:border-r [&_.w-md-editor-toolbar>ul:first-child]:border-border",
          "[&_.w-md-editor-toolbar>ul:first-child]:pr-4",
          // 调整编辑区域样式
          "[&_.w-md-editor-content]:h-[calc(100vh-3.5rem)]",
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
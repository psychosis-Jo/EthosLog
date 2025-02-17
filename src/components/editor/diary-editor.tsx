"use client"

import React, { useState } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface DiaryEditorProps {
  onSubmit: (title: string, content: string) => void
  onCancel: () => void
}

export function DiaryEditor({ onSubmit, onCancel }: DiaryEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const filename = `${Date.now()}-${file.name}`

      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        body: file,
      })

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json()
      const imageUrl = `${window.location.origin}${data.url}`
      
      const imageMarkdown = `![${file.name}](${imageUrl})\n`
      setContent((prev: string) => prev + imageMarkdown)
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败：' + (error as Error).message)
    } finally {
      setUploading(false)
    }
    return (
      <div className="flex flex-col gap-4" data-color-mode="light">
        <Input
          placeholder="日记标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
        />
        <div className="min-h-[400px] border rounded-md">
          <MDEditor
            value={content}
            onChange={(value) => setContent(value || '')}
            preview="live"
            height={400}
            commands={[
              ...commands.getCommands(),
              imageCommand,
            ]}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? '上传中...' : '提交'}
          </Button>
        </div>
      </div>
    )
  }

  const imageCommand = {
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 'aria-label': 'Insert image' },
    icon: <Upload className="w-4 h-4" />,
    execute: async () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          await handleImageUpload(file)
        }
      }
      input.click()
    },
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      return
    }
    onSubmit(title, content)
  }

  return (
    <div className="flex flex-col gap-4" data-color-mode="light">
      <Input
        placeholder="日记标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg"
      />
      <div className="min-h-[400px] border rounded-md">
        <MDEditor
          value={content}
          onChange={(value) => setContent(value || '')}
          preview="edit"
          height={400}
          commands={[
            ...commands.getCommands(),
            imageCommand,
          ]}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={uploading}>
          {uploading ? '上传中...' : '提交'}
        </Button>
      </div>
    </div>
  )
} 
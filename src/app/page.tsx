"use client"

import React, { useCallback } from 'react'
import { useAuth } from "@/lib/auth-context"  // 修正路径
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Pencil } from "lucide-react"
import { DiaryEditor } from "@/components/editor/diary-editor"
import type { Database } from "@/lib/supabase"  // 导入类型
import { useToast } from "@/components/ui/use-toast"
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: ['src', 'alt', 'title']  // 允许图片标签的这些属性
  }
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [diaries, setDiaries] = useState<Database['public']['tables']['diaries']['Row'][]>([])
  const [loadingDiaries, setLoadingDiaries] = useState(true)
  const { toast } = useToast()
  const [selectedDiary, setSelectedDiary] = useState<Database['public']['tables']['diaries']['Row'] | null>(null)
  const [editingDiary, setEditingDiary] = useState<Database['public']['tables']['diaries']['Row'] | null>(null)

  const fetchDiaries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setDiaries(data)
    } catch (error) {
      console.error('Error fetching diaries:', error)
      toast({
        title: "加载失败",
        description: "获取日记列表失败",
        variant: "destructive",
      })
    } finally {
      setLoadingDiaries(false)
    }
  }, [toast])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (user) {
      fetchDiaries()
    }
  }, [user, loading, router, fetchDiaries])

  const handleEdit = (diary: Database['public']['tables']['diaries']['Row']) => {
    setEditingDiary(diary)
    setOpen(true)
  }

  const handleSubmit = async (title: string, content: string) => {
    if (!user) return

    try {
      if (editingDiary) {
        // 更新已有日记
        const { error } = await supabase
          .from('diaries')
          .update({ title, content })
          .eq('id', editingDiary.id)

        if (error) throw error
      } else {
        // 创建新日记
        const { error } = await supabase
          .from('diaries')
          .insert({
            user_id: user.id,
            title,
            content,
          })

        if (error) throw error
      }

      setOpen(false)
      setEditingDiary(null)
      await fetchDiaries()
      toast({
        title: editingDiary ? "更新成功" : "保存成功",
        description: editingDiary ? "日记已更新" : "日记已保存",
      })
    } catch (error) {
      console.error('Error saving diary:', error)
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (diary: Database['public']['tables']['diaries']['Row']) => {
    setSelectedDiary(diary)
  }

  if (loading || loadingDiaries) {
    return <div>加载中...</div>
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="select-none">ETHOSLOG</CardTitle>
        </CardHeader>
      </Card>

      {diaries.length === 0 ? (
        <div className="text-center text-muted-foreground">
          还没有日记，开始写第一篇吧！
        </div>
      ) : (
        diaries.map(diary => (
          <Card key={diary.id} className="mb-4">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(diary.created_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-lg font-medium mt-1">{diary.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(diary)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePreview(diary)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">
                {diary.analysis || '等待 AI 分析...'}
              </p>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setEditingDiary(null)
      }}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-4 right-4 rounded-full p-0 w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingDiary ? '编辑日记' : '新建日记'}</DialogTitle>
          </DialogHeader>
          <DiaryEditor 
            initialTitle={editingDiary?.title}
            initialContent={editingDiary?.content}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpen(false)
              setEditingDiary(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      <Dialog open={!!selectedDiary} onOpenChange={() => setSelectedDiary(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDiary?.title}</DialogTitle>
          </DialogHeader>
          <div data-color-mode="light" className="markdown-body">
            <MDEditor
              value={selectedDiary?.content || ''}
              preview="preview"
              hideToolbar
              visibleDragbar={false}
              height={400}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize, sanitizeSchema]],
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
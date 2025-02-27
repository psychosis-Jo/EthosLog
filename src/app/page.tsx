"use client"

import React, { useCallback } from 'react'
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { DiaryEditor } from "@/components/editor/diary-editor"
import type { Database } from "@/lib/supabase"  // 导入类型
import { useToast } from "@/components/ui/use-toast"
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { analyzeDiary } from "@/lib/ai"
import { UserNav } from "@/components/user-nav"

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
  const [deletingDiary, setDeletingDiary] = useState<Database['public']['tables']['diaries']['Row'] | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

  const fetchDiaries = useCallback(async () => {
    try {
      console.log('Fetching diaries for user:', user?.id)
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user?.id)
        .is('deleted_at', null)  // 只获取未删除的日记
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched diaries with analysis:', data.map(d => ({
        id: d.id,
        title: d.title,
        analysis: d.analysis
      })))
      
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
  }, [toast, user?.id])

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
    if (!user) return;

    try {
      let diaryId: string;

      // 1. 先保存日记
      if (editingDiary) {
        const { error: updateError } = await supabase
          .from('diaries')
          .update({ 
            title, 
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDiary.id);

        if (updateError) throw updateError;
        diaryId = editingDiary.id;
      } else {
        const { data: newDiary, error: insertError } = await supabase
          .from('diaries')
          .insert({
            user_id: user.id,
            title,
            content,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        diaryId = newDiary.id;
      }

      // 2. 保存成功，立即关闭编辑器，刷新列表
      setOpen(false);
      setEditingDiary(null);
      await fetchDiaries();
      toast({
        title: editingDiary ? "更新成功" : "保存成功",
        description: editingDiary ? "日记已更新" : "日记已保存",
      });

      // 3. 启动异步 AI 分析，不等待它完成
      const analyzeAndUpdate = async () => {
        try {
          setAnalyzingId(diaryId);
          const analysis = await analyzeDiary(content);
          
          if (analysis) {
            const { error: analysisError } = await supabase
              .from('diaries')
              .update({ analysis })
              .eq('id', diaryId);

            if (analysisError) {
              console.error('AI 分析更新失败:', analysisError);
              toast({
                title: "AI 分析失败",
                description: "分析结果未能保存，请稍后在日记列表中重试",
                variant: "destructive",
              });
            } else {
              await fetchDiaries();  // 更新列表显示分析结果
            }
          }
        } catch (error) {
          console.error('AI 分析失败:', error);
        } finally {
          setAnalyzingId(null);
        }
      };

      // 启动异步分析但不等待
      analyzeAndUpdate();

    } catch (error) {
      console.error('保存日记失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (diary: Database['public']['tables']['diaries']['Row']) => {
    setSelectedDiary(diary)
  }

  const handleDelete = async () => {
    if (!deletingDiary || !user) return

    try {
      console.log('Soft deleting diary:', deletingDiary.id)
      // 使用 rpc 调用来执行软删除
      const { error, data } = await supabase.rpc('soft_delete_diary', {
        diary_id: deletingDiary.id
      })

      if (error) throw error
      
      // 更新本地状态
      setDiaries(prevDiaries => 
        prevDiaries.filter(d => d.id !== deletingDiary.id)
      )
      
      setDeletingDiary(null)
      toast({
        title: "删除成功",
        description: "日记已删除",
      })
    } catch (error) {
      console.error('Error deleting diary:', error)
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
      setDeletingDiary(null)
    }
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="select-none">ETHOSLOG</CardTitle>
          <UserNav />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingDiary(diary)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">
                {analyzingId === diary.id ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    AI 正在分析...
                  </span>
                ) : (
                  diary.analysis || '等待 AI 分析...'
                )}
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

      <AlertDialog open={!!deletingDiary} onOpenChange={(open) => !open && setDeletingDiary(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这篇日记吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
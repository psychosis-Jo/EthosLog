"use client"

import { useAuth } from "@/lib/auth-context"  // 修正路径
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"
import { DiaryEditor } from "@/components/editor/diary-editor"
import type { Database } from "@/lib/supabase"  // 导入类型
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [diaries, setDiaries] = useState<Database['public']['tables']['diaries']['Row'][]>([])
  const [loadingDiaries, setLoadingDiaries] = useState(true)
  const { toast } = useToast()
  const [selectedDiary, setSelectedDiary] = useState<Database['public']['tables']['diaries']['Row'] | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (user) {
      fetchDiaries()
    }
  }, [user, loading, router])

  const fetchDiaries = async () => {
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
  }

  const handleSubmit = async (title: string, content: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('diaries')
        .insert({
          user_id: user.id,
          title,
          content,
        })

      if (error) throw error

      setOpen(false)
      await fetchDiaries()
      toast({
        title: "保存成功",
        description: "日记已保存",
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePreview(diary)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <Separator className="my-2" />
              <p className="text-sm text-muted-foreground">
                {diary.analysis || '等待 AI 分析...'}
              </p>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
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
            <DialogTitle>新建日记</DialogTitle>
          </DialogHeader>
          <DiaryEditor 
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      <Dialog open={!!selectedDiary} onOpenChange={() => setSelectedDiary(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDiary?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm mt-4">
            {selectedDiary?.content}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
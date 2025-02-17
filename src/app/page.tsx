"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { DiaryEditor } from "@/components/editor/diary-editor"
import { useState } from "react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = (title: string, content: string) => {
    console.log('提交日记:', { title, content })
    setOpen(false)
  }

  if (loading) {
    return <div>Loading...</div>
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

      {/* 示例时间线条目 */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">2024-02-16</div>
          <h3 className="text-lg font-medium mt-1">今天的日记</h3>
          <Separator className="my-2" />
          <p className="text-sm text-muted-foreground">AI分析：关注个人成长和学习</p>
        </CardContent>
      </Card>

      {/* 新建日记按钮和弹窗 */}
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
    </main>
  )
} 
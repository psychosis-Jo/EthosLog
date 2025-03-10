"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { DiaryEditor } from "@/components/editor/diary-editor"

export default function DiaryNewPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (title: string, content: string) => {
    if (!user) return;

    try {
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

      toast({
        title: "保存成功",
        description: "日记已保存",
      });

      router.push('/');
    } catch (error) {
      console.error('Error saving diary:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  }

  const handleCancel = () => {
    router.push('/');
  }

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <DiaryEditor
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </main>
  )
} 
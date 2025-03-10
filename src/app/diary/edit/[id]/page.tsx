"use client"

import React, { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { DiaryEditor } from "@/components/editor/diary-editor"
import { useEffect, useState } from "react"

interface PageProps {
  params: Promise<{ id: string }>
}

function DiaryEditContent({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [diary, setDiary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 获取日记数据
  useEffect(() => {
    const fetchDiary = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('diaries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data.user_id !== user.id) {
          toast({
            title: "访问被拒绝",
            description: "您没有权限编辑这篇日记",
            variant: "destructive",
          });
          router.push('/');
          return;
        }

        setDiary(data);
      } catch (error) {
        console.error('Error fetching diary:', error);
        toast({
          title: "加载失败",
          description: "无法加载日记内容",
          variant: "destructive",
        });
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDiary();
  }, [id, user, router, toast]);

  const handleSubmit = async (title: string, content: string) => {
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('diaries')
        .update({ 
          title, 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "更新成功",
        description: "日记已更新",
      });

      router.push('/');
    } catch (error) {
      console.error('Error updating diary:', error);
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

  if (loading) {
    return <div className="container mx-auto p-4">加载中...</div>;
  }

  return (
    <DiaryEditor
      initialTitle={diary?.title}
      initialContent={diary?.content}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

export default function DiaryEditPage({ params }: PageProps) {
  const id = React.use(params).id;

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <Suspense fallback={<div>加载中...</div>}>
        <DiaryEditContent id={id} />
      </Suspense>
    </main>
  )
} 
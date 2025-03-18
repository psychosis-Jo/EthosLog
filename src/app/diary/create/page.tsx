"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { DiaryEditor } from '@/components/editor/diary-editor'
import { useToast } from '@/components/ui/use-toast'
import { analyzeDiary } from '@/lib/ai'

export default function CreateDiaryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (title: string, content: string, category: string, tags: string[]) => {
    if (!user) return

    try {
      // 创建新日记
      const { data, error } = await supabase
        .from('diaries')
        .insert([
          {
            title,
            content,
            category,
            tags,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error
      
      toast({
        title: '内容已创建',
        description: '您的内容已成功保存。',
      })

      // 触发分析
      if (data && data[0]) {
        try {
          const analysis = await analyzeDiary(content)
          
          if (analysis) {
            const { error } = await supabase
              .from('diaries')
              .update({
                analysis,
              })
              .eq('id', data[0].id)

            if (error) throw error
          }
        } catch (error) {
          console.error('Error analyzing diary:', error)
          // 分析失败不影响保存成功
        }
        
        // 跳转到详情页
        router.push(`/diary/${data[0].id}`)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error saving diary:', error)
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '发生了未知错误',
        variant: 'destructive',
      })
    }
  }

  if (loading || !user) {
    return <div className="container mx-auto p-4 text-center">载入中...</div>
  }

  return (
    <DiaryEditor
      initialTitle=""
      initialContent=""
      initialCategory="复盘"
      onSubmit={handleSubmit}
      onCancel={() => router.push('/')}
    />
  )
} 
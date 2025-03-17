"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { DiaryEditor } from '@/components/editor/diary-editor'
import { useToast } from '@/components/ui/use-toast'
import { analyzeDiary } from '@/lib/ai'

export default function EditDiaryPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [diary, setDiary] = useState<any>(null)
  const [loadingDiary, setLoadingDiary] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchDiary() {
      if (!user || !id) return

      setLoadingDiary(true)
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading diary:', error)
        toast({
          title: '加载内容失败',
          description: error.message,
          variant: 'destructive',
        })
        router.push('/')
      } else {
        setDiary(data)
      }
      setLoadingDiary(false)
    }

    fetchDiary()
  }, [id, user, toast, router])

  const handleSubmit = async (title: string, content: string) => {
    if (!user || !diary) return

    try {
      // 更新日记
      const { error } = await supabase
        .from('diaries')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', diary.id)

      if (error) throw error
      
      toast({
        title: '内容已更新',
        description: '您的内容已成功更新。',
      })

      // 触发分析
      try {
        const analysis = await analyzeDiary(content)
        
        if (analysis) {
          const { error } = await supabase
            .from('diaries')
            .update({
              analysis,
            })
            .eq('id', diary.id)

          if (error) throw error
        }
      } catch (error) {
        console.error('Error analyzing diary:', error)
        // 分析失败不影响保存成功
      }
      
      // 跳转到详情页
      router.push(`/diary/${diary.id}`)
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

  if (loadingDiary) {
    return <div className="container mx-auto p-4 text-center">载入内容中...</div>
  }

  if (!diary) {
    return <div className="container mx-auto p-4 text-center">内容不存在或已被删除</div>
  }

  return (
    <DiaryEditor
      initialTitle={diary.title}
      initialContent={diary.content}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/diary/${diary.id}`)}
    />
  )
} 
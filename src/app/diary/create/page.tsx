"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ByteMDEditor } from '@/components/editor/byte-md-editor'
import { useToast } from '@/components/ui/use-toast'
import { analyzeDiary } from '@/lib/ai'

export default function CreatePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSubmit = async (title: string, content: string, category: string, tags: string[]) => {
    if (!user) {
      toast({
        title: "请先登录",
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category,
          tags,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save diary')
      }

      router.push('/')
    } catch (error) {
      console.error('Error saving diary:', error)
      toast({
        title: "保存失败",
        description: "请重试",
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <>
      <ByteMDEditor
        initialTitle=""
        initialContent=""
        initialCategory="复盘"
        initialTags={[]}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/')}
      />
    </>
  )
} 
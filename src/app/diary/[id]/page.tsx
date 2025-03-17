"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserNav } from '@/components/user-nav'
import { Pencil, MoreVertical, ArrowLeft } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: ['src', 'alt', 'title']  // 允许图片标签的这些属性
  }
}

export default function DiaryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [diary, setDiary] = useState<any>(null)
  const [loadingDiary, setLoadingDiary] = useState(true)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

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

  // 从内容中提取标签
  const extractTags = (content: string) => {
    const matches = content.match(/#[^\s#]+/g) || []
    return matches.map(tag => tag.substring(1)) // 移除#符号
  }

  const handleDelete = async () => {
    if (!diary) return

    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', diary.id)

      if (error) throw error
      
      toast({
        title: '内容已删除',
        description: '您的内容已成功删除。',
      })
      
      router.push('/')
    } catch (error) {
      console.error('Error deleting diary:', error)
      toast({
        title: '删除失败',
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

  const tags = diary.content ? extractTags(diary.content) : []

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header__menu">
          <Link href="/" className="btn-icon" aria-label="返回">
            <ArrowLeft className="icon" />
          </Link>
        </div>
        <div className="header__logo">ETHOSLOG</div>
        <div className="header__search">
          <input type="search" placeholder="搜索..." className="search-input" />
        </div>
        <div className="header__actions">
          <button id="notifications-toggle" className="btn-icon" aria-label="通知">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
            </svg>
            <span className="notification-badge">3</span>
          </button>
          <UserNav />
        </div>
      </header>

      <div className="content-wrapper">
        <main className="main">
          {/* 内容详情区域 */}
          <div className="content-detail">
            {/* 内容标题区域 */}
            <div className="content-header">
              <div className="content-header__title">
                <h1>{diary.title}</h1>
                <div className="content-meta">
                  <div className="content-tags">
                    {tags.map((tag: string, index: number) => (
                      <span className="tag" key={index}>#{tag}</span>
                    ))}
                  </div>
                  <div className="content-date">创建于：{new Date(diary.created_at).toLocaleDateString('zh-CN')}</div>
                </div>
              </div>
              <div className="content-actions">
                <Link href={`/diary/edit/${diary.id}`} className="btn btn-secondary">
                  <Pencil size={16} className="mr-1" /> 编辑
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="btn-icon">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsAlertDialogOpen(true)}>
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* 两栏布局：内容和洞察 */}
            <div className="content-container">
              {/* 内容区域 */}
              <div className="content-main">
                <article className="content-body markdown">
                  <div data-color-mode="light">
                    <MDEditor.Markdown 
                      source={diary.content} 
                      rehypePlugins={[[rehypeSanitize, sanitizeSchema]]} 
                      style={{ backgroundColor: 'transparent', color: 'inherit' }}
                    />
                  </div>
                </article>
              </div>

              {/* 洞察区域 */}
              {diary.analysis && (
                <div className="content-insights">
                  <div className="insights-header">
                    <h2>智者洞察</h2>
                  </div>
                  
                  <section className="insight-section">
                    <h3>AI分析</h3>
                    <p>{diary.analysis}</p>
                  </section>
                  
                  {/* 可以根据分析内容添加更多洞察部分 */}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这篇内容吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
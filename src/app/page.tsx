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
import { Plus, Eye, Pencil, Trash2, Menu } from "lucide-react"
import { DiaryEditor } from "@/components/editor/diary-editor"
import type { Database } from "@/lib/supabase"  // 导入类型
import { useToast } from "@/components/ui/use-toast"
import { Viewer } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import math from '@bytemd/plugin-math'
import mermaid from '@bytemd/plugin-mermaid'
import gemoji from '@bytemd/plugin-gemoji'
import 'bytemd/dist/index.css'
import 'github-markdown-css'
import { analyzeDiary } from "@/lib/ai"
import { UserNav } from "@/components/user-nav"
import Link from 'next/link'
import Head from 'next/head'
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

// HTML到纯文本的转换函数
function htmlToText(html: string): string {
  if (!html) return '';
  
  // 移除HTML标签但保留文本内容
  let text = html.replace(/<[^>]*>/g, ' ');
  // 替换多个空格为单个空格
  text = text.replace(/\s+/g, ' ');
  // 替换HTML实体
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  return text.trim();
}

// 格式化AI分析内容，转换为HTML无序列表并加粗"-"到":"之间的内容
function formatAnalysis(analysis: string): React.ReactNode {
  if (!analysis) return null;
  
  // 检查是否已经是HTML格式（防止重复处理）
  if (analysis.includes('<li>')) return <div dangerouslySetInnerHTML={{ __html: analysis }} />;
  
  // 分割为行以处理每个项目
  const lines = analysis.split('\n').filter(line => line.trim());
  
  return (
    <ul className="analysis-list">
      {lines.map((line, index) => {
        // 找到以"-"开头的行
        const listItem = line.trim().startsWith('-') ? line.trim().substring(1).trim() : line.trim();
        
        // 查找冒号位置
        const colonIndex = listItem.indexOf(':');
        
        if (colonIndex > 0) {
          // 分离标签和内容
          const label = listItem.substring(0, colonIndex + 1);
          const content = listItem.substring(colonIndex + 1);
          
          return (
            <li key={index}>
              <strong>{label}</strong>{content}
            </li>
          );
        }
        
        // 没有冒号的行
        return <li key={index}>{listItem}</li>;
      })}
    </ul>
  );
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
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState('grid')
  const [filterType, setFilterType] = useState('全部')
  const [filterTag, setFilterTag] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')

  // 自动从内容中提取标签 - 移到这里，在使用之前定义
  const extractTags = (diary: Database['public']['tables']['diaries']['Row']) => {
    return diary.tags || [];
  }

  // 从所有日记中获取标签集合
  const getAllTags = () => {
    const tagSet = new Set<string>();
    diaries.forEach(diary => {
      const tags = extractTags(diary);
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }

  const allTags = getAllTags();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function getDiaries() {
      if (!user) return

      setLoadingDiaries(true)
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading diaries:', error)
        toast({
          title: '加载日记失败',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        setDiaries(data)
      }
      setLoadingDiaries(false)
    }

    getDiaries()
  }, [user, toast])

  const handleEdit = (diary: Database['public']['tables']['diaries']['Row']) => {
    setEditingDiary(diary)
    setOpen(true)
  }

  const handleSubmit = async (title: string, content: string, category: string, tags: string[]) => {
    if (!user) return

    setOpen(false)

    try {
      if (editingDiary) {
        // 更新日记
        const { error } = await supabase
          .from('diaries')
          .update({
            title,
            content,
            category,
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDiary.id)

        if (error) throw error

        // 更新本地状态
        setDiaries(prevDiaries =>
          prevDiaries.map(diary =>
            diary.id === editingDiary.id
              ? { ...diary, title, content, category, tags, updated_at: new Date().toISOString() }
              : diary
          )
        )

        setEditingDiary(null)
        
        toast({
          title: '日记已更新',
          description: '您的日记已成功更新。',
        })

        // 触发分析
        const updatedDiary = diaries.find(diary => diary.id === editingDiary.id)
        if (updatedDiary) {
          setAnalyzingId(updatedDiary.id)
          analyzeAndUpdate(updatedDiary.id, title, content)
        }
      } else {
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

        if (data) {
          // 更新本地状态
          setDiaries(prevDiaries => [data[0], ...prevDiaries])
          
          toast({
            title: '日记已创建',
            description: '您的日记已成功保存。',
          })

          // 触发分析
          setAnalyzingId(data[0].id)
          analyzeAndUpdate(data[0].id, title, content)
        }
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

  const analyzeAndUpdate = async (diaryId: string, title: string, content: string) => {
    try {
      const analysis = await analyzeDiary(content)
      
      if (analysis) {
        const { error } = await supabase
          .from('diaries')
          .update({
            analysis,
          })
          .eq('id', diaryId)

        if (error) throw error

        // 更新本地状态
        setDiaries(prevDiaries =>
          prevDiaries.map(diary =>
            diary.id === diaryId
              ? { ...diary, analysis }
              : diary
          )
        )
      }
    } catch (error) {
      console.error('Error analyzing diary:', error)
      toast({
        title: '分析失败',
        description: '日记内容分析失败，请稍后重试。',
        variant: 'destructive',
      })
    } finally {
      setAnalyzingId(null)
    }
  }

  const handlePreview = (diary: Database['public']['tables']['diaries']['Row']) => {
    setSelectedDiary(diary)
  }

  const handleDelete = async () => {
    if (!deletingDiary) return

    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', deletingDiary.id)

      if (error) throw error

      // 更新本地状态
      setDiaries(prevDiaries => prevDiaries.filter(diary => diary.id !== deletingDiary.id))
      
      setDeletingDiary(null)
      setIsAlertDialogOpen(false)
      
      toast({
        title: '日记已删除',
        description: '您的日记已成功删除。',
      })
    } catch (error) {
      console.error('Error deleting diary:', error)
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '发生了未知错误',
        variant: 'destructive',
      })
    }
  }

  const confirmDelete = (diary: Database['public']['tables']['diaries']['Row']) => {
    setDeletingDiary(diary)
    setIsAlertDialogOpen(true)
  }

  // 筛选日记
  const filteredDiaries = diaries.filter(diary => {
    // 根据分类筛选
    if (filterType !== '全部') {
      // 使用diary.category字段进行筛选
      if (diary.category !== filterType) {
        return false;
      }
    }
    
    // 根据标签筛选
    if (filterTag !== '全部') {
      const tags = extractTags(diary);
      if (!tags.includes(filterTag)) {
        return false;
      }
    }
    
    // 根据搜索词筛选
    if (searchTerm && !(
      diary.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      htmlToText(diary.content).toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false
    }
    
    return true
  })

  // ByteMD插件
  const plugins = [
    gfm(),
    highlight(),
    math(),
    mermaid(),
    gemoji()
  ]

  if (loading || !user) {
    return <div className="container mx-auto p-4 text-center">载入中...</div>
  }

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header__menu">
          <button id="sidebar-toggle" className="btn-icon" aria-label="菜单">
            <Menu className="icon" />
          </button>
        </div>
        <div className="header__logo" style={{ color: "white" }}>ETHOSLOG</div>
        <div className="header__search">
          <input 
            type="search" 
            placeholder="搜索..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          {/* 内容库页面 */}
          <div className="content-library">
            {/* 筛选和搜索工具栏 */}
            <div className="library-toolbar">
              <div className="toolbar-filters">
                <div className="filter-group">
                  <label htmlFor="filter-type">分类：</label>
                  <select 
                    id="filter-type" 
                    className="form-control form-control-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option>全部</option>
                    <option>复盘</option>
                    <option>知识</option>
                    <option>灵感</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="filter-tag">标签：</label>
                  <select 
                    id="filter-tag" 
                    className="form-control form-control-sm"
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                  >
                    <option>全部</option>
                    {allTags.map(tag => (
                      <option key={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="toolbar-views">
                <span>查看方式：</span>
                <button 
                  className={`view-btn ${currentView === 'grid' ? 'active' : ''}`} 
                  data-view="grid" 
                  aria-label="网格视图"
                  onClick={() => setCurrentView('grid')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${currentView === 'list' ? 'active' : ''}`} 
                  data-view="list" 
                  aria-label="列表视图"
                  onClick={() => setCurrentView('list')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 内容卡片网格 */}
            <div className={`content-grid view-${currentView}`}>
              {loadingDiaries ? (
                <div className="text-center p-4">载入中...</div>
              ) : filteredDiaries.length === 0 ? (
                <div className="text-center p-4">暂无内容</div>
              ) : (
                filteredDiaries.map(diary => (
                  <div className="content-card" key={diary.id}>
                    <div className="card-header">
                      <h3 className="card-title">
                        <Link href={`/diary/${diary.id}`}>
                          {diary.title}
                        </Link>
                      </h3>
                      <div className="card-tags">
                        {diary.category && <span className="category-badge">{diary.category}</span>}
                        {extractTags(diary).map((tag, index) => (
                          <span className="tag" key={index}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-content-preview">{htmlToText(diary.content).substring(0, 100)}...</p>
                    </div>
                    <div className="card-footer">
                      <span className="card-date">
                        {new Date(diary.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <div className="card-actions">
                        <Link 
                          href={`/diary/edit/${diary.id}`}
                          className="btn-icon" 
                          aria-label="编辑"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button 
                          className="btn-icon" 
                          aria-label="删除"
                          onClick={() => confirmDelete(diary)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 分页控制 */}
            {filteredDiaries.length > 0 && (
              <div className="pagination">
                <button className="pagination-btn" disabled>上一页</button>
                <span className="pagination-info">第1页，共1页</span>
                <button className="pagination-btn" disabled>下一页</button>
              </div>
            )}
          </div>

          {/* 快速添加按钮 */}
          <Link 
            href="/diary/create"
            className="fab" 
            aria-label="添加新内容"
          >
            <svg className="icon" viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </Link>
        </main>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingDiary ? '编辑记录' : '新建记录'}</DialogTitle>
          </DialogHeader>
          <DiaryEditor
            initialTitle={editingDiary?.title || ''}
            initialContent={editingDiary?.content || ''}
            onSubmit={handleSubmit}
            onCancel={() => {
              setOpen(false)
              setEditingDiary(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      {selectedDiary && (
        <Dialog open={!!selectedDiary} onOpenChange={(open) => !open && setSelectedDiary(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedDiary.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="mb-2 text-sm text-gray-500">
                {new Date(selectedDiary.created_at).toLocaleString('zh-CN')}
              </div>
              <Separator className="my-2" />
              <div data-color-mode="light">
                <Viewer 
                  value={selectedDiary.content} 
                  plugins={plugins}
                />
              </div>
              {selectedDiary.analysis && (
                <>
                  <Separator className="my-4" />
                  <div className="p-4 bg-primary/10 rounded-md">
                    <h3 className="font-semibold mb-3">智者洞察</h3>
                    {formatAnalysis(selectedDiary.analysis)}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这篇日记吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingDiary(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
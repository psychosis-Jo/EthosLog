"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { CheckCircle, User, MapPin, ArrowLeft } from "lucide-react"

interface Profile {
  username: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    username: "",
    avatar_url: null,
    bio: "",
    location: ""
  })
  const [pageLoading, setPageLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const getProfile = async () => {
      try {
        setPageLoading(true)
        const { data, error } = await supabase
          .from("user_profiles")
          .select("username, avatar_url, bio, location")
          .eq("id", user.id)
          .single()

        if (error) throw error

        if (data) {
          setProfile({
            username: data.username,
            avatar_url: data.avatar_url,
            bio: data.bio || "",
            location: data.location || ""
          })
        }
      } catch (error) {
        console.error("获取资料失败:", error)
        toast({
          title: "获取资料失败",
          description: "请刷新页面重试",
          variant: "destructive",
        })
      } finally {
        setPageLoading(false)
      }
    }

    getProfile()
  }, [user, authLoading, router, toast])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">认证中...</p>
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isUploading) {
      toast({
        title: "请等待",
        description: "头像正在上传中",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    if (!profile.username) {
      toast({
        title: "验证失败",
        description: "用户名不能为空",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(profile.username)) {
      toast({
        title: "验证失败",
        description: "用户名只能包含字母、数字、下划线和连字符",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (profile.username.length < 2 || profile.username.length > 30) {
      toast({
        title: "验证失败",
        description: "用户名长度必须在2-30个字符之间",
        variant: "destructive",
      })
      setLoading(false)
      return
    }
    
    if (profile.bio && profile.bio.length > 200) {
      toast({
        title: "验证失败",
        description: "个人简介不能超过200个字符",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      // 先尝试查询确认用户资料是否存在
      const { data: existingProfile, error: queryError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user?.id)
        .single()

      if (queryError) {
        console.error("查询失败:", queryError)
        throw queryError
      }

      // 根据是否存在选择插入或更新
      const { error: upsertError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user?.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          updated_at: new Date().toISOString(),
        }, {
          // 指定唯一性约束
          onConflict: 'id'
        })

      if (upsertError) {
        console.error("更新失败:", upsertError)
        throw upsertError
      }

      toast({
        title: "更新成功",
        description: "你的个人资料已更新",
      })

      // 显示成功动画
      setSaveSuccess(true)
      
      // 2秒后重置动画状态并跳转
      setTimeout(() => {
        setSaveSuccess(false)
        router.push("/")
      }, 2000)
    } catch (error: any) {
      console.error("更新失败:", error)
      toast({
        title: "更新失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-muted/30">
      <Button 
        variant="ghost" 
        size="sm"
        className="mb-6 flex items-center gap-1"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">个人资料</h1>
        
        <form onSubmit={handleUpdateProfile}>
          <div className="grid gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  基本资料
                </CardTitle>
                <CardDescription>设置你的个人信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-6">
                  <AvatarUpload
                    url={profile.avatar_url}
                    onUpload={(url) => {
                      setProfile({ ...profile, avatar_url: url })
                      setIsUploading(false)
                    }}
                    onUploading={(uploading) => setIsUploading(uploading)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    用户名
                  </label>
                  <Input
                    id="username"
                    value={profile.username || ""}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="设置你的用户名"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  个人详情
                </CardTitle>
                <CardDescription>分享更多关于你的信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    个人简介
                  </label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="简单介绍一下你自己（最多200字）"
                    maxLength={200}
                  />
                  {profile.bio && (
                    <p className="text-xs text-muted-foreground text-right">
                      {profile.bio.length}/200
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    位置
                  </label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="你所在的城市"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className={`relative overflow-hidden transition-all ${saveSuccess ? 'bg-green-600 hover:bg-green-600' : ''}`}
              disabled={loading || saveSuccess}
            >
              {loading ? (
                "更新中..."
              ) : saveSuccess ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  已保存
                </span>
              ) : (
                "保存个人资料"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Profile {
  username: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    username: "",
    avatar_url: null,
  })
  const [pageLoading, setPageLoading] = useState(true)

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
          .select("username, avatar_url")
          .eq("id", user.id)
          .single()

        if (error) throw error

        if (data) {
          setProfile({
            username: data.username,
            avatar_url: data.avatar_url,
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">个人资料</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            完善你的个人信息
          </p>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
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
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              variant="outline"
              className="w-full border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              disabled={loading}
            >
              {loading ? "更新中..." : "更新资料"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 
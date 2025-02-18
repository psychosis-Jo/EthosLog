"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        let username = email.split('@')[0]
          .replace(/[^a-zA-Z0-9_-]/g, '') // 移除不允许的字符
          .toLowerCase()
        
        // 确保用户名符合长度要求
        if (username.length < 2) {
          username = username + Math.random().toString(36).slice(2, 4)
        } else if (username.length > 30) {
          username = username.slice(0, 30)
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              username,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])

        if (profileError) throw profileError
      }

      toast({
        title: "注册成功",
        description: "请查看邮箱完成验证",
      })

      router.push("/login")
    } catch (error) {
      console.error("注册失败:", error)
      toast({
        title: "注册失败",
        description: "请稍后重试",
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
          <CardTitle className="text-2xl text-center">注册 ETHOSLOG</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            开始你的成长历程
          </p>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="至少6个字符"
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
              {loading ? "注册中..." : "注册"}
            </Button>
            <div className="w-full flex flex-col gap-2 items-center">
              <div className="relative w-full text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <span className="relative px-2 text-xs text-muted-foreground bg-background">
                  或者
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                已有账号？立即登录
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 
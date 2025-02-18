"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/")
    } catch (error) {
      console.error("登录失败:", error)
      toast({
        title: "登录失败",
        description: "请检查邮箱和密码",
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
          <CardTitle className="text-2xl text-center">登录 ETHOSLOG</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            继续你的成长历程
          </p>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
                placeholder="输入密码"
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
              {loading ? "登录中..." : "登录"}
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
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => router.push("/register")}
                >
                  注册账号
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-1/2"
                  onClick={() => router.push("/forgot-password")}
                >
                  忘记密码？
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 
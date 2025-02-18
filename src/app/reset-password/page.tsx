"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast({
        title: "密码已更新",
        description: "请使用新密码登录",
      })

      router.push("/login")
    } catch (error) {
      console.error("重置失败:", error)
      toast({
        title: "重置失败",
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
          <CardTitle className="text-2xl text-center">设置新密码</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            请输入你的新密码
          </p>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                新密码
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
          <CardFooter>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-2 border-primary hover:bg-primary hover:text-primary-foreground"
              disabled={loading}
            >
              {loading ? "更新中..." : "更新密码"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 
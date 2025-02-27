"use client"

import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { User, LogOut, Settings } from "lucide-react"

export function UserNav() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar url={user?.user_metadata?.avatar_url} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onSelect={() => router.push("/profile")}
        >
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onSelect={() => router.push("/settings")}
        >
          <div className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between"
          onSelect={handleSignOut}
        >
          <div className="flex items-center text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
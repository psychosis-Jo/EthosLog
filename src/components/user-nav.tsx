"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

export function UserNav() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="relative">
      <button 
        className="btn-icon" 
        aria-label="用户" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </button>
      
      {isMenuOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          style={{ top: '100%' }}
        >
          <div className="py-1">
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                router.push("/profile");
              }}
            >
              个人资料
            </a>
            <a
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                router.push("/settings");
              }}
            >
              设置
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                handleSignOut();
              }}
            >
              退出登录
            </a>
          </div>
        </div>
      )}
      
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
} 
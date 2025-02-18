"use client"

import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
} 
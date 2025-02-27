"use client"

import { Avatar as AvatarPrimitive, AvatarFallback, AvatarImage } from "@/components/ui/avatar-primitive"
import { User } from "lucide-react"

interface AvatarProps {
  url: string | null
  className?: string
}

export function Avatar({ url, className }: AvatarProps) {
  return (
    <AvatarPrimitive className={className}>
      {url ? (
        <AvatarImage src={url} alt="Avatar" />
      ) : (
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </AvatarPrimitive>
  )
} 
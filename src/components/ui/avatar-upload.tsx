"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"

interface AvatarUploadProps {
  url: string | null
  onUpload: (url: string) => void
  onUploading: (uploading: boolean) => void
  size?: number
}

export function AvatarUpload({ url, onUpload, onUploading, size = 150 }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const uploadAvatar = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setUploading(true)
        onUploading(true)

        if (!event.target.files || event.target.files.length === 0) {
          throw new Error("请选择要上传的图片")
        }

        const file = event.target.files[0]
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`

        // 上传到 Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // 构建完整的 URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const fullUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`

        onUpload(fullUrl)
      } catch (error: any) {
        toast({
          title: "上传失败",
          description: error.message || "请稍后重试",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        onUploading(false)
      }
    },
    [onUpload, onUploading, toast]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {url ? (
        <div 
          className="relative w-[150px] h-[150px] border-2 border-dashed border-muted-foreground rounded-full overflow-hidden hover:border-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            document.getElementById("avatar")?.click()
          }}
        >
          <Image
            src={url}
            alt="Avatar"
            className="rounded-full object-cover"
            fill
            sizes={`${size}px`}
          />
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <div 
          className="w-[150px] h-[150px] rounded-full border-2 border-dashed border-muted-foreground hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            document.getElementById("avatar")?.click()
          }}
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            上传头像
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            document.getElementById("avatar")?.click()
          }}
        >
          {uploading ? "上传中..." : "更换头像"}
        </Button>
        {url && (
          <Button
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onUpload("")
            }}
          >
            移除
          </Button>
        )}
      </div>
      <input
        id="avatar"
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        className="hidden"
      />
    </div>
  )
} 
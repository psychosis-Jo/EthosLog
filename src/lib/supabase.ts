import { createClient } from '@supabase/supabase-js'

// 定义数据库类型
export type Database = {
  public: {
    tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
        }
      }
      diaries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          analysis: string | null
          category: string | null
          tags: string[] | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          content: string
          analysis?: string | null
          category?: string | null
          tags?: string[] | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          analysis?: string | null
          category?: string | null
          tags?: string[] | null
          deleted_at?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) 
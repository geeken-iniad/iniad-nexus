import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers' // これは必要です！

export async function createClient() {
  // 👈 ここ！最新のNext.jsでは await が必要
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからはクッキーをセットできないので
            // ここでエラーが出ても無視してOK（ミドルウェアが代わりにやるため）
          }
        },
      },
    }
  )
}
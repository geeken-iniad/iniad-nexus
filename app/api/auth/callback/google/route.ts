// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
// 先ほど作ったサーバー用クライアントをインポート
import { createClient } from '@/utils/supabase/server'

const ALLOWED_EMAIL_DOMAINS = ['iniad.org']

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // ログイン後に飛ばしたい先（例：ダッシュボードやホーム）
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    // Googleから届いたコードを、正式なログインセッションに交換する
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      const email = user?.email ?? ''
      const emailDomain = email.split('@')[1] ?? ''

      if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラーが起きた場合はログインページなどに戻す
  return NextResponse.redirect(`${origin}/login`)
}
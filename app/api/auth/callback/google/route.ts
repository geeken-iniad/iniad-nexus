// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
// 先ほど作ったサーバー用クライアントをインポート
import { createClient } from '@/utils/supabase/server'

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
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // エラーが起きた場合はログインページなどに戻す
  return NextResponse.redirect(`${origin}/login`)
}
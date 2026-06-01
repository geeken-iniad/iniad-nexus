// app/api/auth/callback/google/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  if (!code) {
    console.error('[Auth Callback Error]: No code found in request URL.')
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  try {
    const response = NextResponse.redirect(`${origin}${next}`)
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback Error] Exchange failed:', {
        message: error.message,
        status: error.status,
        name: error.name
      })

      const encodedError = encodeURIComponent(error.message)
      return NextResponse.redirect(`${origin}/login?error=callback_failed&message=${encodedError}`)
    }

    // ここでログインしたユーザーのメールドメインを取得し、iniad.org のみ許可する
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email ?? ''
    const emailDomain = email.split('@')[1] ?? ''

    if (emailDomain !== 'iniad.org') {
      console.warn(`[Auth] Blocked login attempt from unauthorized domain: ${emailDomain}`)
      // 不正なドメインの場合はセッションを作成しないため、クッキーを付与していない別のリダイレクトを返す
      return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
    }

    return response

  } catch (unexpectedError) {
    console.error('[Auth Callback Unexpected Error]:', unexpectedError)

    const errorMessage = unexpectedError instanceof Error ? unexpectedError.message : 'Unknown server error'
    const encodedError = encodeURIComponent(errorMessage)
    
    return NextResponse.redirect(`${origin}/login?error=server_crash&message=${encodedError}`)
  }
}

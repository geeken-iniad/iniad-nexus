'use client'

import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const supabase = createClient()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback/google`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          scopes: 'https://www.googleapis.com/auth/calendar.events',
        },
      },
    })

    if (error) console.error(error.message)
  }

  const errorMessage =
    errorParam === 'unauthorized_domain'
      ? 'iniad.org のメールアドレスのみログインできます。'
      : null

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,#d9f3ff_0%,#f8fbff_36%,#eef5ff_72%,#e8f1ff_100%)] px-6 text-slate-900">
      <div className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/INIAD-nexus_icon.webp"
            alt="INIAD NEXUS ロゴ"
            width={220}
            height={220}
            className="rounded-full bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.16)] ring-1 ring-white/60"
            priority={true}
          />
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-[0.06em] md:text-6xl lg:text-7xl gradient-title">
              Welcome to INIAD NEXUS!
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              iniad.org のアカウントでログインしてください。
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {errorMessage}
          </div>
        ) : null}

        <button
          onClick={handleGoogleLogin}
          className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#33C5C5] via-[#4FBED2] to-[#2B86B8] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#2B86B8]/20 transition-transform duration-200 hover:-translate-y-0.5 hover:from-[#2BBFBF] hover:via-[#46B8CD] hover:to-[#2378A6] focus:outline-none focus:ring-4 focus:ring-[#2B86B8]/20"
        >
          <span>Googleでログイン</span>
        </button>
      </div>
    </div>
  )
}

export default function LogIn() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#d9f3ff_0%,#f8fbff_36%,#eef5ff_72%,#e8f1ff_100%)]" />}>
      <LoginContent />
    </Suspense>
  )
}
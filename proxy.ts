// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server'; 

export async function proxy(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // デバッグ用：今どこでセッションがどうなってるかターミナルに出す
  console.log(`[Proxy] Path: ${pathname}, Session: ${!!session}`);

  // 1. ログインしていない 且つ 「/login」以外のページにいるなら、ログインへ飛ばす
  if (!session && pathname !== '/login' && pathname === '/') {
    console.log("-> Redirecting to /login (No Session)");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. すでにログインしている 且つ 「/login」にアクセスしようとしたら、ホームへ飛ばす
  if (session && pathname === '/login') {
    console.log("-> Redirecting to / (Session exists)");
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // matcher を絞り込むことで、画像やAPIなどの余計なリダイレクトを防ぐ
  matcher: ['/', '/login'],
};
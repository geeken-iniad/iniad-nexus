'use client'

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function LogIn() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const supabase = createClient();
      const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback/google`,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
              scopes: "https://www.googleapis.com/auth/calendar.events",
            },
          },
        });
        if (error) console.error(error.message);
      };

    const errorMessage = error === 'unauthorized_domain'
      ? 'iniad.org のメールアドレスのみログインできます。'
      : null;

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-[1200px] bg-white/90 dark:bg-gray-900/80 p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <Image src="/INIAD-nexus_icon.webp"
              alt="INIAD NEXUS ロゴ"
              width={256}
              height={256}
              className="rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-700 shadow-md mb-4"
              priority={true}/>
              <h1 className="text-5xl md:text-6xl lg:text-7xl gradient-title">Welcome to INIAD NEXUS!</h1>
            </div>
            {errorMessage ? (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
            <button
              onClick={handleGoogleLogin}
              className="w-60 mt-4 px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21.6 12.227c0-.68-.061-1.334-.175-1.964H12v3.723h5.66c-.244 1.318-.99 2.435-2.117 3.188v2.651h3.415c1.999-1.843 3.617-4.55 3.617-7.598z" fill="#4285F4"/>
                <path d="M12 22c2.88 0 5.295-.954 7.06-2.587l-3.415-2.651C15.274 17.06 13.72 17.78 12 17.78c-2.31 0-4.272-1.56-4.97-3.658H3.455v2.296C5.2 19.98 8.37 22 12 22z" fill="#34A853"/>
                <path d="M7.03 13.122A5.99 5.99 0 0 1 6.8 12c0-.411.04-.81.105-1.177V8.526H3.455A9.993 9.993 0 0 0 2 12c0 1.61.37 3.132 1.02 4.474l3.01-3.352z" fill="#FBBC05"/>
                <path d="M12 6.18c1.56 0 2.966.538 4.07 1.593l3.046-3.046C17.292 2.12 14.88 1 12 1 8.37 1 5.2 3.02 3.455 5.838L7.03 9.19C7.728 7.093 9.69 6.18 12 6.18z" fill="#EA4335"/>
              </svg>
              <span>Googleでログイン</span>
            </button>
          </div>
        </div>
    )
}
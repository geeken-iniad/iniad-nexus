'use client'

import { createClient } from "@/utils/supabase/client";

export default function LogIn() {

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

    return(
        <div className="mt-8 rounded-2xl flex flex-col items-center justify-center">
        <div>
          <button
            onClick={handleGoogleLogin}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <span className=" text-black">Googleでログイン</span>
          </button>
        </div>
      </div>
    )
}
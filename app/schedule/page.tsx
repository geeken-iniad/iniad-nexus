'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            // Supabaseからログインユーザーを取得
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                // ログインしていない場合はホームへ
                router.push("/");
            } else {
                setUser(user);
            }
            setLoading(false);
        };
        checkUser();
    }, [supabase, router]);

    // ログアウト処理
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) return <div className="p-10 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-blue-900">スケジュール</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{user?.email}</span>
                    <button 
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 hover:text-red-500 transition"
                    >
                        ログアウト
                    </button>
                </div>
            </nav>
            <main className="p-4 md:p-8 h-[calc(100vh-80px)]">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-200">
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=primary&ctz=Asia/Tokyo"
                        style={{ border: 0 }}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                    ></iframe>
                </div>
            </main>
        </div>
    );
}
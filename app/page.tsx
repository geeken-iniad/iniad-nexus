"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import TimetableHomeSummary from "./components/timetable/TimetableHomeSummary";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

const VISIBLE_APP_COUNT = 6;
const ITEM_STEP_PX = 80;

type HomeUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
};

export default function Home() {
  const apps: AppLink[] = [
    { name: "Toyo-net ACE", url: "https://www.ace.toyo.ac.jp/",      color: "bg-blue-600",   icon: "/img/ACE.jpg" },
    { name: "Toyo-net G",   url: "https://g-sys.toyo.ac.jp/portal/", color: "bg-green-600",  icon: "/img/G.jpg" },
    { name: "INIAD MOOCS",  url: "https://moocs.iniad.org/",          color: "bg-purple-600", icon: "/img/INIAD.jpg" },
    { name: "Slack",        url: "slack://open",                      color: "bg-red-500",    icon: "/img/slack.png" },
    { name: "Classroom",    url: "https://classroom.google.com/",     color: "bg-amber-500",  icon: "/img/Classroom.jpg" },
    { name: "Gemini",       url: "https://gemini.google.com/",        color: "bg-indigo-500", icon: "/img/gemini-color.png" },
    { name: "ChatGPT",      url: "https://chatgpt.com/",              color: "bg-teal-600",   icon: "/img/OpenAI-white-monoblossom.png" },
    { name: "Timetable",    url: "/timetable",                        color: "bg-gray-700",   icon: "/img/Timetable.jpg" },
  ];

  const [supabaseUser, setSupabaseUser] = useState<HomeUser | null>(null);
  const [scrollIndex,  setScrollIndex]  = useState(0);

  useEffect(() => {
    fetch("/api/calendar-user")
      .then((res) => res.json())
      .then((data) => setSupabaseUser(data));
  }, []);

  const maxScrollIndex = Math.max(0, apps.length - VISIBLE_APP_COUNT);

  const userName =
    supabaseUser?.user_metadata?.full_name ??
    supabaseUser?.user_metadata?.name ??
    supabaseUser?.email ??
    "User";

  const userAvatar = supabaseUser?.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-gray-900 p-6 pb-24 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col gap-4">

        {/* ヘッダー */}
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-gray-800/70 px-4 py-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/INIAD-nexus_icon.webp"
              alt="INIAD NEXUS ロゴ"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full bg-white/10 object-cover"
              priority
            />
            <div>
              <p className="text-xs text-gray-400">INIAD Nexus</p>
              <h1 className="text-lg font-bold text-white">Home</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-2">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#33C5C5] to-[#2B86B8] text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-sm font-semibold text-white">{userName}</p>
          </div>
        </header>

        {/* メインエリア */}
        <div className="flex min-h-[calc(100vh-14rem)] gap-4">

          {/* 左：アプリ一覧 */}
          <aside className="w-28 shrink-0 rounded-3xl border border-white/10 bg-gray-800/70 p-3 shadow-xl flex flex-col items-center">
            
            <div className="flex w-full flex-col gap-2.5">
              {/* 上へスクロールボタン */}
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                disabled={scrollIndex === 0}
                className="flex w-full justify-center rounded-2xl bg-gray-700 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="上へスクロール"
              >
                ⋀
              </button>

              {/* スクロールするアイコン領域 */}
              <div className="overflow-hidden w-full flex justify-center" style={{ height: VISIBLE_APP_COUNT * ITEM_STEP_PX }}>
                <div
                  className="transition-transform duration-300 ease-in-out flex flex-col items-center"
                  style={{ transform: `translateY(-${scrollIndex * ITEM_STEP_PX}px)` }}
                >
                  <div className="flex flex-col gap-4">
                    {apps.map((app) => (
                      <a
                        key={app.name}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={app.name}
                        // ここが正方形にするクラスです
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md transition-transform hover:scale-105 hover:shadow-lg"
                      >
                        {/* iconImageが設定されていれば画像、なければ頭文字 */}
                        {app.icon ? (
                          <Image
                            src={app.icon}
                            alt={app.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <span className="text-xl font-bold text-gray-800">
                            {app.name.charAt(0)}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* 下へスクロールボタン */}
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.min(maxScrollIndex, i + 1))}
                disabled={scrollIndex === maxScrollIndex}
                className="flex w-full justify-center rounded-2xl bg-gray-700 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="下へスクロール"
              >
                ⋁
              </button>
            </div>
          </aside>

          {/* 右：時間割（閲覧のみ） */}
          <section className="flex flex-col flex-1 min-h-0 rounded-3xl border border-white/10 bg-gray-800/70 p-5 shadow-xl">
            <div className="mb-2 shrink-0">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Schedule</p>
              <h2 className="text-xl font-bold leading-tight">時間割</h2>
            </div>
            <div className="flex-1 min-h-0">
              <TimetableHomeSummary />
            </div>
          </section>

        </div>
      </div>
      <BottomNav />
    </main>
  );
}

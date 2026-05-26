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
const ITEM_STEP_PX = 72;

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
    { name: "Toyo-net ACE", url: "https://www.ace.toyo.ac.jp/",      color: "bg-blue-600",   icon: "A" },
    { name: "Toyo-net G",   url: "https://g-sys.toyo.ac.jp/portal/", color: "bg-green-600",  icon: "G" },
    { name: "INIAD MOOCS",  url: "https://moocs.iniad.org/",          color: "bg-purple-600", icon: "M" },
    { name: "Slack",        url: "slack://open",                      color: "bg-red-500",    icon: "S" },
    { name: "Classroom",    url: "https://classroom.google.com/",     color: "bg-amber-500",  icon: "C" },
    { name: "Gemini",       url: "https://gemini.google.com/",        color: "bg-indigo-500", icon: "G" },
    { name: "ChatGPT",      url: "https://chatgpt.com/",              color: "bg-teal-600",   icon: "C" },
    { name: "Timetable",    url: "/timetable",                        color: "bg-gray-700",   icon: "T" },
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
          <aside className="w-72 shrink-0 rounded-3xl border border-white/10 bg-gray-800/70 p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold">INIAD Nexus</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                {apps.length} apps
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                disabled={scrollIndex === 0}
                className="rounded-2xl bg-gray-700 px-4 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="上へスクロール"
              >⋀</button>

              <div className="overflow-hidden" style={{ height: VISIBLE_APP_COUNT * ITEM_STEP_PX }}>
                <div
                  className="transition-transform duration-300 ease-in-out"
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
                        className={`${app.color} flex h-14 items-center gap-3 rounded-2xl px-4 shadow-lg transition-opacity hover:opacity-90`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                          {app.icon}
                        </span>
                        <span className="truncate text-sm font-semibold">{app.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.min(maxScrollIndex, i + 1))}
                disabled={scrollIndex === maxScrollIndex}
                className="rounded-2xl bg-gray-700 px-4 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="下へスクロール"
              >⋁</button>
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

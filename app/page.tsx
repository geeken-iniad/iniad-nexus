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
    { name: "Toyo-net ACE", url: "https://www.ace.toyo.ac.jp/",      color: "bg-blue-600",   icon: "/img/ACE.png" },
    { name: "Toyo-net G",   url: "https://g-sys.toyo.ac.jp/portal/", color: "bg-green-600",  icon: "/img/G.png" },
    { name: "INIAD MOOCS",  url: "https://moocs.iniad.org/",          color: "bg-purple-600", icon: "/img/INIAD.jpg" },
    { name: "Slack",        url: "slack://open",                      color: "bg-red-500",    icon: "/img/slack.png" },
    { name: "Gemini",       url: "https://gemini.google.com/",        color: "bg-indigo-500", icon: "/img/gemini-color.png" },
    { name: "ChatGPT",      url: "https://chatgpt.com/",              color: "bg-teal-600",   icon: "/img/OpenAI-black-monoblossom.png" },
    { name: "赤羽台事務課",     url: "https://sites.google.com/iniad.org/iniad-office-students",color: "bg-gray-500",   icon: "/img/事務課.png" },
    { name: "赤羽台図書館",        url: "https://www.toyo.ac.jp/library/",   color: "bg-yellow-600", icon: "/img/図書館.png" },
  
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
    <main className="min-h-screen bg-gradient-to-br from-[#EBF4FA] via-[#D0E2FF] to-[#C1DBFE] p-6 pb-24 text-gray-800">
      {/* 背景色ここで変更 */}
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col gap-4">
        {/* ヘッダー ,shadow-xl を一度削除*/}
        <header className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Image
              src="/INIAD-nexus_icon.webp"
              alt="INIAD NEXUS ロゴ"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full bg-white/ object-coverborder border-gray-100"
              priority
            />
            <div>
              <p className="text-xs text-gray-500">INIAD Nexus</p>
              <h1 className="text-lg font-bold text-gray-800">Home</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-gray-500/10 px-3 py-2">
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
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
          </div>
        </header>

        {/* メインエリア */}
        {/* flex-col（縦）と md:flex-row（PCは横）を追加 */}
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-14rem)] gap-4">

          {/* 左：アプリ一覧 */}
          {/* order-2、w-fullを追加し、flex-row（横並び）と overflow-x-auto（横スクロール）を追加 */}
          {/* 左：アプリ一覧（スマホ時は下部） */}
          <aside className="order-2 md:order-1 w-full md:w-28 shrink-0 rounded-3xl border border-white/60 bg-white/60 p-3 flex items-center overflow-hidden">
            <div className="flex w-full flex-row md:flex-col gap-2.5 items-center justify-between">
              
              {/* 戻る / 上へ ボタン */}
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                disabled={scrollIndex === 0}
                className="flex h-12 w-8 md:h-auto md:w-full shrink-0 justify-center items-center rounded-2xl bg-white/80 py-2 text-lg font-bold hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="前へスクロール"
              >
                {/* スマホは ＜、PCは ⋀ を表示 */}
                <span className="md:hidden">＜</span>
                <span className="hidden md:inline">⋀</span>
              </button>

              {/* スクロールするアイコン領域 */}
              <div className="overflow-hidden flex flex-1 justify-start md:justify-center md:h-[480px]">
                {/* 魔法のクラス：スマホはX軸（横）、PCはY軸（縦）にスライド方向を自動で切り替えます */}
                <div
                  className="transition-transform duration-300 ease-in-out flex flex-row md:flex-col items-center gap-4 translate-x-[var(--scroll)] md:translate-x-0 md:translate-y-[var(--scroll)]"
                  style={{ '--scroll': `-${scrollIndex * 80}px` } as React.CSSProperties}
                >
                  {apps.map((app) => (
                    <a
                      key={app.name}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={app.name}
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white transition-transform hover:scale-105"
                    >
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

              {/* 次へ / 下へ ボタン */}
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.min(maxScrollIndex, i + 1))}
                disabled={scrollIndex === maxScrollIndex}
                className="flex h-12 w-8 md:h-auto md:w-full shrink-0 justify-center items-center rounded-2xl bg-white/80 py-2 text-lg font-bold text-gray-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="次へスクロール"
              >
                {/* スマホは ＞、PCは ⋁ を表示 */}
                <span className="md:hidden">＞</span>
                <span className="hidden md:inline">⋁</span>
              </button>
            </div>
          </aside>

          {/* 右：時間割（閲覧のみ） */}
          {/* order-1（スマホは1番目）と md:order-2（PCは2番目）を追加 */}
          <section className="order-1 md:order-2 flex flex-col flex-1 min-h-0 rounded-3xl border border-white/60 bg-white/60 p-5 text-gray-800">
            <div className="mb-2 shrink-0">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Schedule</p>
              <h2 className="text-xl font-bold leading-tight text-gray-800">時間割</h2>
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

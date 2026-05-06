"use client";

import { useEffect, useState } from "react";
import Calender from "./components/calendar/client";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

const VISIBLE_APP_COUNT = 6; // ここを変えると「同時に見せる最大数」を変更できる
const ITEM_STEP_PX = 72; // 1アイコン分の縦移動量（高さ + 余白）

export default function Home() {
  const apps: AppLink[] = [
    {
      name: "Toyo-net ACE",
      url: "https://www.ace.toyo.ac.jp/",
      color: "bg-blue-600",
      icon: "A",
    },
    {
      name: "Toyo-net G",
      url: "https://g-sys.toyo.ac.jp/portal/",
      color: "bg-green-600",
      icon: "G",
    },
    {
      name: "INIAD MOOCS",
      url: "https://moocs.iniad.org/",
      color: "bg-purple-600",
      icon: "M",
    },
    { name: "Slack", url: "slack://open", color: "bg-red-500", icon: "S" },
    {
      name: "Classroom",
      url: "https://classroom.google.com/",
      color: "bg-amber-500",
      icon: "C",
    },
    {
      name: "Gemini",
      url: "https://gemini.google.com/",
      color: "bg-indigo-500",
      icon: "G",
    },
    {
      name: "ChatGPT",
      url: "https://chatgpt.com/",
      color: "bg-teal-600",
      icon: "C",
    },
    { name: "Timetable", url: "/timetable", color: "bg-gray-700", icon: "T" },
  ];

  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    fetch("/api/calendar-user")
      .then((res) => res.json())
      .then((data) => setSupabaseUser(data));
  }, []);

  const maxScrollIndex = Math.max(0, apps.length - VISIBLE_APP_COUNT);

  const handleScrollUp = () => {
    setScrollIndex((current) => Math.max(0, current - 1));
  };

  const handleScrollDown = () => {
    setScrollIndex((current) => Math.min(maxScrollIndex, current + 1));
  };

  const showCalendar = false; // まだ実装しないなら false のまま

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl gap-6">
        {/* 左：縦1列のアプリ一覧 */}
        <aside className="w-72 shrink-0 rounded-3xl border border-white/10 bg-gray-800/70 p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">INIAD Nexus</h1>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
              {apps.length} apps
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleScrollUp}
              disabled={scrollIndex === 0}
              className="rounded-2xl bg-gray-700 px-4 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="上へスクロール"
            >
              ⋀
            </button>

            <div
              className="overflow-hidden"
              style={{ height: VISIBLE_APP_COUNT * ITEM_STEP_PX }}
            >
              <div
                className="transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateY(-${scrollIndex * ITEM_STEP_PX}px)`,
                }}
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
                      <span className="truncate text-sm font-semibold">
                        {app.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScrollDown}
              disabled={scrollIndex === maxScrollIndex}
              className="rounded-2xl bg-gray-700 px-4 py-2 text-lg font-bold hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="下へスクロール"
            >
              ⋁
            </button>
          </div>
        </aside>

        {/* 右：時間割エリア */}
        <section className="flex-1 rounded-3xl border border-white/10 bg-gray-800/70 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">右側エリア</p>
              <h2 className="text-2xl font-bold">時間割</h2>
            </div>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-300">
              未実装
            </span>
          </div>

          {/* 時間割の仮レイアウト */}
          <div className="grid h-[calc(100%-4rem)] grid-cols-6 gap-3">
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              時限
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              月
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              火
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              水
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              木
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center text-sm font-bold">
              金
            </div>

            {Array.from({ length: 5 }).map((_, row) => (
              <div key={`row-${row}`} className="contents">
                <div className="rounded-xl bg-white/5 p-3 text-center text-sm">
                  {row + 1}
                </div>
                {Array.from({ length: 5 }).map((_, col) => (
                  <div
                    key={`cell-${row}-${col}`}
                    className="rounded-xl border border-dashed border-white/10 bg-white/5 p-3 text-xs text-gray-400"
                  >
                    予定
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* まだ使わない場合は showCalendar=false のままでOK */}
          {showCalendar ? <Calender user={supabaseUser} /> : null}
        </section>
      </div>
    </main>
  );
}

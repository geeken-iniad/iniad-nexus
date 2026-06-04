// page.tsx

"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import LogoutButton from "./components/LogoutButton";
import TimetableGrid from "./components/timetable/TimetableGrid";
import TimetableHomeSummary from "./components/timetable/TimetableHomeSummary";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

const ITEM_STEP_PX = 64;
const notices = [
  { date: "", title: "～開発中～完成をお待ちください", isNew: true },
];

type HomeUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
};

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5v-2.1A5.4 5.4 0 0 1 10.9 12h2.2a5.4 5.4 0 0 1 5.4 5.4v2.1" />
    </svg>
  );
}

export default function Home() {
  const apps: AppLink[] = [
    { name: "Toyo-net ACE", url: "https://www.ace.toyo.ac.jp/",      color: "bg-blue-600",   icon: "/img/ACE.png" },
    { name: "Toyo-net G",   url: "https://g-sys.toyo.ac.jp/portal/", color: "bg-green-600",  icon: "/img/G.png" },
    { name: "INIAD MOOCS",  url: "https://moocs.iniad.org/",          color: "bg-purple-600", icon: "/img/INIAD.jpg" },
    { name: "Slack",        url: "slack://open",                      color: "bg-red-500",    icon: "/img/slack.png" },
    { name: "Classroom",    url: "https://classroom.google.com/",     color: "bg-amber-500",  icon: "/img/96x96_yellow_stroke_icon@2x (1).png" },
    { name: "Gemini",       url: "https://gemini.google.com/",        color: "bg-indigo-500", icon: "/img/gemini-color.png" },
    { name: "ChatGPT",      url: "https://chatgpt.com/",              color: "bg-teal-600",   icon: "/img/OpenAI-black-monoblossom.png" },
    { name: "Timetable",    url: "/timetable",                        color: "bg-gray-700",   icon: "/img/96x96_yellow_stroke_icon@2x.png" },
    { name: "赤羽台事務課",     url: "https://sites.google.com/iniad.org/iniad-office-students",color: "bg-gray-500",   icon: "/img/事務課.png" },
    { name: "赤羽台図書館",        url: "https://www.toyo.ac.jp/library/",   color: "bg-yellow-600", icon: "/img/図書館.png" },
  
  ];

  const [supabaseUser, setSupabaseUser] = useState<HomeUser | null>(null);
  const [scrollIndex,  setScrollIndex]  = useState(0);
  const [visibleAppCount, setVisibleAppCount] = useState(3);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isScheduleNoticeOpen, setIsScheduleNoticeOpen] = useState(false);
  const [timetableRefreshKey, setTimetableRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/calendar-user")
      .then((res) => res.json())
      .then((data) => setSupabaseUser(data));
  }, []);

  useEffect(() => {
    const updateVisibleAppCount = () => {
      const isDesktopLayout = window.matchMedia("(orientation: landscape) and (min-width: 900px)").matches;

      if (!isDesktopLayout) {
        const controlsWidth = 28 + 28 + 44 + 16;
        const availableWidth = window.innerWidth - controlsWidth;
        setVisibleAppCount(Math.max(4, Math.min(10, Math.floor(availableWidth / ITEM_STEP_PX))));
        return;
      }

      const headerHeight = Math.min(96, Math.max(64, window.innerWidth * 0.08));
      const controlsHeight = 28 + 28 + 52 + 32;
      const availableHeight = window.innerHeight - headerHeight - controlsHeight;
      setVisibleAppCount(Math.max(2, Math.min(4, Math.floor(availableHeight / ITEM_STEP_PX))));
    };

    updateVisibleAppCount();
    window.addEventListener("resize", updateVisibleAppCount);
    return () => window.removeEventListener("resize", updateVisibleAppCount);
  }, []);

  const maxScrollIndex = Math.max(0, apps.length - visibleAppCount);

  const userName =
    supabaseUser?.user_metadata?.full_name ??
    supabaseUser?.user_metadata?.name ??
    supabaseUser?.email ??
    "User";

  const userAvatar = supabaseUser?.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-white text-[#32323b]">
      <div className="min-h-screen w-full overflow-hidden bg-white">
        <header className="relative z-10 flex h-[clamp(64px,8vw,96px)] items-center justify-between bg-[#eaf7fb] px-[clamp(10px,2.5vw,36px)] shadow-[0_14px_22px_-12px_rgba(145,112,205,0.32)]">
          <div className="flex items-center gap-3 landscape:min-[900px]:gap-5">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-[#e0f4eb] shadow-[0_6px_14px_-6px_rgba(46,100,130,0.55)] landscape:min-[900px]:h-[72px] landscape:min-[900px]:w-[72px] landscape:min-[900px]:rounded-2xl">
              <Image
                src="/INIAD-nexus_icon.webp"
                alt="INIAD NEXUS ロゴ"
                width={66}
                height={66}
                className="h-[52px] w-[52px] rounded-lg object-contain landscape:min-[900px]:h-[66px] landscape:min-[900px]:w-[66px] landscape:min-[900px]:rounded-xl"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeOpen((current) => !current)}
              aria-label="おしらせを開く"
              aria-expanded={isNoticeOpen}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#247fc1] text-lg text-white transition-transform hover:scale-105 landscape:min-[900px]:h-[52px] landscape:min-[900px]:w-[52px] landscape:min-[900px]:text-xl"
            >
              ♘
              <span className="absolute -left-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 landscape:min-[900px]:h-3.5 landscape:min-[900px]:w-3.5" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((current) => !current)}
              aria-label="アカウントメニューを開く"
              aria-expanded={isAccountMenuOpen}
              className="flex items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-white/55 landscape:min-[900px]:gap-3 landscape:min-[900px]:px-2"
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5961] text-white">
                  <UserIcon />
                </div>
              )}
              <p className="max-w-24 truncate text-xs font-semibold sm:max-w-44 sm:text-sm">{userName}</p>
            </button>

            <div
              className={[
                "absolute right-0 top-full mt-2 w-36 origin-top overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out",
                isAccountMenuOpen
                  ? "translate-y-0 scale-y-100 opacity-100"
                  : "-translate-y-2 scale-y-0 pointer-events-none opacity-0",
              ].join(" ")}
            >
              <LogoutButton className="w-full px-4 py-3 text-center text-sm font-bold text-[#e0525e] transition-colors hover:bg-[#fff0f1]">
                ログアウト
              </LogoutButton>
            </div>
          </div>
        </header>

        {isNoticeOpen && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/15 px-4 py-8">
            <section className="min-h-[min(72vh,620px)] w-[min(92vw,760px)] rounded-3xl bg-gradient-to-b from-[#e9fbf7] to-[#b9dcf7] px-[clamp(20px,4vw,48px)] pb-16 pt-6 shadow-xl">
              <div className="relative border-b-2 border-[#4c565c] pb-4 text-center">
                <h2 className="text-[clamp(16px,2vw,22px)] font-extrabold">おしらせ＆ニュース</h2>
                <button
                  type="button"
                  onClick={() => setIsNoticeOpen(false)}
                  aria-label="おしらせを閉じる"
                  className="absolute -right-1 -top-2 text-4xl font-light leading-none text-[#344048] transition-transform hover:scale-110"
                >
                  ×
                </button>
              </div>

              <ul className="mt-[clamp(48px,8vh,88px)] space-y-[clamp(20px,3vh,34px)]">
                {notices.map((notice) => (
                  <li key={`${notice.date}-${notice.title}`} className="flex items-center gap-2 text-[clamp(14px,1.8vw,19px)] font-semibold">
                    {notice.isNew && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#ff7b89] text-sm font-extrabold text-[#ff7b89]">
                        !
                      </span>
                    )}
                    <span className="underline underline-offset-2">
                      {notice.date}　{notice.title}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {isTimetableOpen && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/15 px-4 py-8">
            <section className="flex h-[min(92vh,900px)] w-[min(94vw,960px)] flex-col rounded-3xl bg-gradient-to-b from-[#e9fbf7] to-[#d7ebfb] px-[clamp(16px,3vw,36px)] pb-6 pt-5 shadow-xl">
              <div className="relative mb-4 border-b-2 border-[#4c565c] pb-3 text-center">
                <h2 className="text-[clamp(20px,2.5vw,28px)] font-extrabold md:text-3xl">時間割登録</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimetableOpen(false);
                    setTimetableRefreshKey((current) => current + 1);
                  }}
                  aria-label="時間割登録を閉じる"
                  className="absolute -right-1 -top-2 text-4xl font-light leading-none text-[#344048] transition-transform hover:scale-110"
                >
                  ×
                </button>
              </div>
              <div className="min-h-0 flex-1">
                <TimetableGrid />
              </div>
            </section>
          </div>
        )}

        {isScheduleNoticeOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/35 px-4 py-8">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-notice-title"
              className="w-[min(88vw,480px)] rounded-3xl bg-gradient-to-b from-[#e9fbf7] to-[#d7ebfb] px-6 py-8 text-center shadow-2xl"
            >
              <h2 id="schedule-notice-title" className="text-lg font-extrabold sm:text-xl md:text-2xl">
                ～開発中～完成をお待ちください
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsScheduleNoticeOpen(false);
                  setIsTimetableOpen(false);
                }}
                className="mt-7 min-w-28 rounded-full bg-[#2785bf] px-8 py-3 text-base font-bold text-white shadow-sm transition-transform hover:scale-105 md:text-lg"
              >
                OK
              </button>
            </section>
          </div>
        )}

        <div className="flex min-h-[calc(100vh-clamp(64px,8vw,96px))] flex-col landscape:min-[900px]:flex-row">
          <aside className="order-2 mt-auto flex w-full shrink-0 items-center bg-gradient-to-r from-[#c7eef0] to-[#79bdea] px-2 py-2 shadow-[0_-8px_18px_-14px_rgba(56,99,130,0.7)] landscape:min-[900px]:order-1 landscape:min-[900px]:mt-0 landscape:min-[900px]:w-[clamp(80px,9vw,120px)] landscape:min-[900px]:bg-gradient-to-b landscape:min-[900px]:px-3 landscape:min-[900px]:shadow-none">
            <div className="flex w-full flex-row items-center justify-center gap-2 landscape:min-[900px]:flex-col">
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                disabled={scrollIndex === 0}
                className="flex h-full w-7 shrink-0 items-center justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible landscape:min-[900px]:h-7 landscape:min-[900px]:w-full"
                aria-label="上へスクロール"
              >
                <span className="landscape:min-[900px]:hidden">‹</span>
                <span className="hidden landscape:min-[900px]:inline">⋀</span>
              </button>

              <div
                className="h-[52px] min-w-0 flex-1 overflow-hidden landscape:min-[900px]:h-[var(--app-list-size)] landscape:min-[900px]:w-full landscape:min-[900px]:flex-none"
                style={{ "--app-list-size": `${visibleAppCount * ITEM_STEP_PX}px` } as CSSProperties}
              >
                <div
                  className="flex items-center transition-transform duration-300 ease-in-out translate-x-[var(--app-scroll)] landscape:min-[900px]:flex-col landscape:min-[900px]:translate-x-0 landscape:min-[900px]:translate-y-[var(--app-scroll)]"
                  style={{ "--app-scroll": `-${scrollIndex * ITEM_STEP_PX}px` } as CSSProperties}
                >
                  <div className="flex flex-row gap-3 landscape:min-[900px]:flex-col">
                    {apps.map((app) => (
                      <a
                        key={app.name}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={app.name}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center transition-transform hover:scale-110"
                      >
                        {app.icon ? (
                          <Image
                            src={app.icon}
                            alt={app.name}
                            width={52}
                            height={52}
                            className="h-[52px] w-[52px] rounded-full border-2 border-white bg-white object-contain"
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

              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.min(maxScrollIndex, i + 1))}
                disabled={scrollIndex === maxScrollIndex}
                className="flex h-full w-7 shrink-0 items-center justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible landscape:min-[900px]:h-7 landscape:min-[900px]:w-full"
                aria-label="下へスクロール"
              >
                <span className="landscape:min-[900px]:hidden">›</span>
                <span className="hidden landscape:min-[900px]:inline">⋁</span>
              </button>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border-2 border-white pb-1 text-3xl font-light leading-none text-white landscape:min-[900px]:h-[52px] landscape:min-[900px]:w-[52px] landscape:min-[900px]:text-4xl">
                +
              </div>
            </div>
          </aside>

          <section className="order-1 flex flex-col gap-3 overflow-hidden px-[clamp(12px,5vw,80px)] py-4 portrait:min-[700px]:gap-6 landscape:min-[900px]:order-2 landscape:min-[900px]:flex-1 landscape:min-[900px]:flex-row landscape:min-[900px]:items-start landscape:min-[900px]:gap-[clamp(44px,8vw,140px)] landscape:min-[900px]:py-[clamp(20px,4vw,56px)]">
            <div className="h-[clamp(420px,65vh,720px)] w-full shrink-0 rounded-2xl bg-white p-2 shadow-[0_10px_28px_-22px_rgba(48,72,92,0.65)] portrait:min-[700px]:h-[calc(100vh-clamp(64px,8vw,96px)-52px-128px)] landscape:min-[900px]:h-[clamp(242px,48vw,620px)] landscape:min-[900px]:w-[clamp(340px,52vw,760px)] landscape:min-[900px]:rounded-none landscape:min-[900px]:p-0 landscape:min-[900px]:shadow-none">
              <TimetableHomeSummary key={timetableRefreshKey} />
            </div>
            <div className="flex shrink-0 items-center justify-center gap-3 px-1 landscape:min-[900px]:h-[clamp(242px,48vw,620px)] landscape:min-[900px]:flex-1 landscape:min-[900px]:flex-col landscape:min-[900px]:self-start landscape:min-[900px]:gap-[clamp(28px,4vw,54px)] landscape:min-[900px]:px-0">
              <button
                type="button"
                onClick={() => setIsTimetableOpen(true)}
                className="w-full max-w-48 rounded-full bg-gradient-to-r from-[#d5f3e8] to-[#88c9f5] px-3 py-3 text-center text-sm font-bold shadow-sm transition-transform hover:scale-105 min-[900px]:min-w-52 min-[900px]:py-4 min-[900px]:text-base portrait:min-[700px]:max-w-60 landscape:min-[900px]:w-[clamp(208px,18vw,250px)] landscape:min-[900px]:max-w-none landscape:min-[900px]:px-5"
              >
                授業登録
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimetableOpen(true);
                  setIsScheduleNoticeOpen(true);
                }}
                className="w-full max-w-48 rounded-full bg-[#2785bf] px-3 py-3 text-center text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 min-[900px]:min-w-52 min-[900px]:py-4 min-[900px]:text-base portrait:min-[700px]:max-w-60 landscape:min-[900px]:w-[clamp(208px,18vw,250px)] landscape:min-[900px]:max-w-none landscape:min-[900px]:px-5"
              >
                予定登録
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./components/LogoutButton";
import TimetableHomeSummary from "./components/timetable/TimetableHomeSummary";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

const VISIBLE_APP_COUNT = 4;
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
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

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
    <main className="min-h-screen bg-white text-[#32323b]">
      <div className="min-h-screen w-full overflow-hidden bg-white">
        <header className="relative z-10 flex h-[clamp(68px,8vw,96px)] items-center justify-between bg-[#eaf7fb] px-[clamp(16px,2.5vw,36px)] shadow-[0_14px_22px_-12px_rgba(145,112,205,0.32)]">
          <div className="flex items-center gap-5">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-[#e0f4eb] shadow-[0_6px_14px_-6px_rgba(46,100,130,0.55)]">
              <Image
                src="/INIAD-nexus_icon.webp"
                alt="INIAD NEXUS ロゴ"
                width={66}
                height={66}
                className="h-[66px] w-[66px] rounded-xl object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeOpen((current) => !current)}
              aria-label="おしらせを開く"
              aria-expanded={isNoticeOpen}
              className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#247fc1] text-xl text-white transition-transform hover:scale-105"
            >
              ♘
              <span className="absolute -left-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-red-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/inquiry_form"
              className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#247fc1] shadow-sm transition-colors hover:bg-white sm:px-4 sm:py-2 sm:text-sm"
            >
              お問い合わせはこちら
            </Link>

            <div
              className={[
                "absolute right-0 top-full mt-2 w-36 origin-top flex flex-col overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out",
                isAccountMenuOpen
                  ? "translate-y-0 scale-y-100 opacity-100"
                  : "-translate-y-2 scale-y-0 pointer-events-none opacity-0",
              ].join(" ")}
            >
              {/* マイページへのリンクを追加 */}
              <Link
                href="/mypage"
                className="block w-full px-4 py-3 text-center text-sm font-bold text-[#344048] border-b border-gray-100 transition-colors hover:bg-[#eaf7fb]"
              >
                マイページ
              </Link>
              
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

        <div className="flex min-h-[calc(100vh-clamp(68px,8vw,96px))]">
          <aside className="flex w-[clamp(80px,9vw,120px)] shrink-0 items-center bg-gradient-to-b from-[#c7eef0] to-[#79bdea] px-3 py-2">
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, i - 1))}
                disabled={scrollIndex === 0}
                className="flex h-7 w-full justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible"
                aria-label="上へスクロール"
              >
                ⋀
              </button>

              <div className="w-full overflow-hidden" style={{ height: VISIBLE_APP_COUNT * ITEM_STEP_PX }}>
                <div
                  className="flex flex-col items-center transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateY(-${scrollIndex * ITEM_STEP_PX}px)` }}
                >
                  <div className="flex flex-col gap-3">
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
                className="flex h-7 w-full justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible"
                aria-label="下へスクロール"
              >
                ⋁
              </button>
              <div className="flex h-[52px] w-[52px] items-center justify-center self-center rounded-full border-2 border-white pb-1 text-4xl font-light leading-none text-white">
                +
              </div>
            </div>
          </aside>

          <section className="flex flex-1 flex-col gap-8 px-[clamp(24px,5vw,80px)] py-[clamp(20px,4vw,56px)] md:flex-row md:items-start md:gap-[clamp(44px,8vw,140px)]">
            <div className="h-[clamp(242px,48vw,620px)] w-full shrink-0 md:w-[clamp(340px,52vw,760px)]">
              <TimetableHomeSummary />
            </div>
            <div className="flex flex-1 items-center justify-center gap-4 self-stretch md:flex-col md:gap-[clamp(28px,4vw,54px)]">
              <Link
                href="/timetable"
                className="w-[clamp(140px,15vw,230px)] rounded-full bg-gradient-to-r from-[#d5f3e8] to-[#88c9f5] px-4 py-[clamp(11px,1.3vw,17px)] text-center text-[clamp(13px,1.15vw,17px)] font-bold transition-transform hover:scale-105"
              >
                授業登録
              </Link>
              <Link
                href="/timetable"
                className="w-[clamp(140px,15vw,230px)] rounded-full bg-[#2785bf] px-4 py-[clamp(11px,1.3vw,17px)] text-center text-[clamp(13px,1.15vw,17px)] font-bold text-white transition-transform hover:scale-105"
              >
                予定登録
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

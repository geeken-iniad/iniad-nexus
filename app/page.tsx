// page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoutButton from "./components/LogoutButton";
import TimetableHomeSummary from "./components/timetable/TimetableHomeSummary";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

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

function MegaphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current stroke-[2]">
      <path d="M4 11.5v2.8a2 2 0 0 0 2 2h1.8l1.4 3.2a1.6 1.6 0 0 0 1.5.9h.9a1 1 0 0 0 .9-1.4l-1.2-2.7" />
      <path d="M7 11.4 18.3 6.2a1.1 1.1 0 0 1 1.6 1v11.5a1.1 1.1 0 0 1-1.6 1L7 14.4z" />
      <path d="M20 9.2a3.4 3.4 0 0 1 0 6.6" />
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
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/calendar-user")
      .then((res) => res.json())
      .then((data) => setSupabaseUser(data));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const userName =
    supabaseUser?.user_metadata?.full_name ??
    supabaseUser?.user_metadata?.name ??
    supabaseUser?.email ??
    "User";

  const userAvatar = supabaseUser?.user_metadata?.avatar_url;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#d7eadc] via-[#c9e9e6] to-[#17c1ce] p-2 text-[#32323b] sm:p-[clamp(12px,3vw,32px)]">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1180px] flex-col overflow-hidden rounded-[22px] bg-white/20 shadow-[0_24px_70px_-36px_rgba(25,70,91,0.65)] backdrop-blur-sm sm:min-h-[calc(100vh-clamp(24px,6vw,64px))] sm:rounded-[28px]">
        <header className="relative z-10 m-2 flex min-h-16 items-center justify-between rounded-xl bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md sm:m-4 sm:h-[clamp(64px,7vw,84px)] sm:px-[clamp(12px,2.5vw,28px)] sm:py-0 portrait:min-[700px]:h-[clamp(72px,8vw,96px)] portrait:min-[700px]:px-[clamp(14px,2.8vw,32px)]">
          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-[#e0f4eb] shadow-[0_6px_14px_-6px_rgba(46,100,130,0.55)] sm:h-16 sm:w-16 portrait:min-[700px]:h-[72px] portrait:min-[700px]:w-[72px]">
              <Image
                src="/INIAD-nexus_icon.webp"
                alt="INIAD NEXUS ロゴ"
                width={66}
                height={66}
                className="h-10 w-10 rounded-lg object-contain sm:h-[58px] sm:w-[58px] portrait:min-[700px]:h-16 portrait:min-[700px]:w-16"
                priority
              />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 portrait:min-[700px]:text-xs">INIAD Nexus</p>
              <h1 className="text-xl font-extrabold text-[#27323a] portrait:min-[700px]:text-2xl">Home</h1>
            </div>
            <button
              type="button"
              onClick={() => setIsNoticeOpen((current) => !current)}
              aria-label="おしらせを開く"
              aria-expanded={isNoticeOpen}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white shadow-sm transition-transform hover:scale-105 sm:h-[52px] sm:w-[52px] portrait:min-[700px]:h-[58px] portrait:min-[700px]:w-[58px]"
            >
              <MegaphoneIcon />
              <span className="absolute -left-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-red-500" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/inquiry_form"
              className="hidden rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#247fc1] shadow-sm transition-colors hover:bg-white sm:inline-block sm:px-4 sm:py-2 sm:text-sm portrait:min-[700px]:px-5 portrait:min-[700px]:py-2.5 portrait:min-[700px]:text-base"
            >
              お問い合わせはこちら
            </Link>
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                aria-label="アカウントメニューを開く"
                aria-expanded={isAccountMenuOpen}
                className="flex min-w-[112px] max-w-[42vw] items-center gap-2 rounded-full bg-white/85 px-2 py-1.5 shadow-sm transition-transform hover:scale-105 sm:min-w-[174px] sm:max-w-none sm:gap-3 sm:px-4 portrait:min-[700px]:min-w-[210px] portrait:min-[700px]:py-2"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={40}
                    height={40}
                    className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9 portrait:min-[700px]:h-11 portrait:min-[700px]:w-11"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18b46b] text-white sm:h-9 sm:w-9 portrait:min-[700px]:h-11 portrait:min-[700px]:w-11">
                    <UserIcon />
                  </div>
                )}
                <span className="min-w-0 truncate text-xs font-extrabold text-[#2d3138] sm:text-base portrait:min-[700px]:text-lg">
                  {userName}
                </span>
              </button>

              <div
                className={[
                  "absolute right-0 top-full mt-2 w-36 origin-top overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out",
                  isAccountMenuOpen
                    ? "translate-y-0 scale-y-100 opacity-100"
                    : "-translate-y-2 scale-y-0 pointer-events-none opacity-0",
                ].join(" ")}
              >
                <Link
                  href="/mypage"
                  className="block w-full border-b border-gray-100 px-4 py-3 text-center text-sm font-bold text-[#344048] transition-colors hover:bg-[#eaf7fb]"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  マイページ
                </Link>

                <LogoutButton className="w-full px-4 py-3 text-center text-sm font-bold text-[#e0525e] transition-colors hover:bg-[#fff0f1]">
                  ログアウト
                </LogoutButton>
              </div>
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

        <div className="flex flex-1 flex-col gap-3 px-2 pb-2 md:flex-row md:gap-4 md:px-4 md:pb-4">
          <aside className="order-2 flex w-full shrink-0 items-center justify-center rounded-2xl bg-white/45 px-3 py-2 backdrop-blur-sm md:order-1 md:w-[84px] md:px-2 md:py-4 portrait:min-[700px]:w-[104px] portrait:min-[700px]:px-3">
            <div className="flex w-full flex-row items-center justify-start gap-3 overflow-x-auto md:max-h-[calc(100vh-160px)] md:flex-col md:justify-center md:overflow-x-visible md:overflow-y-auto">
              {apps.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={app.name}
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-white/85 shadow-sm transition-transform hover:scale-110 portrait:min-[700px]:h-[64px] portrait:min-[700px]:w-[64px]"
                >
                  {app.icon ? (
                    <Image
                      src={app.icon}
                      alt={app.name}
                      width={52}
                      height={52}
                      className="h-[48px] w-[48px] rounded-lg object-contain portrait:min-[700px]:h-[60px] portrait:min-[700px]:w-[60px]"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-800">
                      {app.name.charAt(0)}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </aside>

          <section className="order-1 flex flex-1 items-start px-0 py-1 md:order-2 md:px-[clamp(8px,3vw,36px)] md:py-[clamp(8px,3vw,36px)] portrait:min-[700px]:px-2 portrait:min-[700px]:py-2">
            <div className="w-full max-w-[980px] portrait:min-[700px]:max-w-none">
              <div className="min-h-[clamp(560px,calc(100dvh-172px),780px)] rounded-[20px] bg-white/62 p-3 shadow-sm backdrop-blur-md sm:min-h-[min(820px,calc(100vh-190px))] sm:p-[clamp(14px,2.8vw,28px)] md:rounded-[24px] portrait:min-[700px]:min-h-[min(860px,calc(100vh-190px))] portrait:min-[700px]:p-[clamp(18px,3.2vw,34px)] portrait:min-[700px]:rounded-[28px] landscape:md:min-h-[clamp(560px,72vh,780px)]">
                <TimetableHomeSummary />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

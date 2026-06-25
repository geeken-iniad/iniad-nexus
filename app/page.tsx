// page.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import LogoutButton from "./components/LogoutButton";
import TimetableHomeSummary from "./components/timetable/TimetableHomeSummary";

type AppLink = {
  name: string;
  url: string;
  color: string;
  icon: string;
};

type CustomLink = {
  id: string;
  name: string;
  url: string;
};

type DisplayAppLink = AppLink & {
  id: string;
};

const VISIBLE_APP_COUNT = 4;
const ITEM_STEP_PX = 64;
const DEFAULT_CUSTOM_LINK_COLOR = "bg-white";
const notices = [
  { date: "", title: "～開発中～完成をお待ちください", isNew: true },
];

const createCustomLinkId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

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

type CustomLinkModalProps = {
  customLinks: CustomLink[];
  onAdd: (link: Omit<CustomLink, "id">) => void;
  onUpdate: (id: string, link: Omit<CustomLink, "id">) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onClose: () => void;
};

function CustomLinkModal({
  customLinks,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
  onClose,
}: CustomLinkModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) {
        return;
      }

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!activeElement || !modalRef.current.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setError("名前を入力してください");
      return;
    }

    if (!trimmedUrl) {
      setError("URLを入力してください");
      return;
    }

    if (!isValidHttpUrl(trimmedUrl)) {
      setError("http:// または https:// で始まるURLを入力してください");
      return;
    }

    if (editingId) {
      onUpdate(editingId, { name: trimmedName, url: trimmedUrl });
    } else {
      onAdd({ name: trimmedName, url: trimmedUrl });
    }

    resetForm();
    nameInputRef.current?.focus();
  };

  const handleEdit = (link: CustomLink) => {
    setEditingId(link.id);
    setName(link.name);
    setUrl(link.url);
    setError(null);
    nameInputRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-link-modal-title"
    >
      <section ref={modalRef} className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="custom-link-modal-title" className="text-base font-bold text-slate-800">
              カスタムリンク
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="カスタムリンク管理を閉じる"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(88vh-76px)] space-y-5 overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <div>
              <label htmlFor="custom-link-name" className="mb-1 block text-xs font-semibold text-slate-500">
                名前
              </label>
              <input
                ref={nameInputRef}
                id="custom-link-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "custom-link-form-error" : undefined}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例: 大学ポータル"
              />
            </div>

            <div>
              <label htmlFor="custom-link-url" className="mb-1 block text-xs font-semibold text-slate-500">
                URL
              </label>
              <input
                id="custom-link-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "custom-link-form-error" : undefined}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://example.com"
              />
            </div>

            {error && (
              <p id="custom-link-form-error" role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-11 rounded-lg px-4 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="ml-auto min-h-11 rounded-lg bg-blue-500 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                {editingId ? "反映" : "追加"}
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-xs font-bold text-slate-500">登録済みリンク</h3>
            {customLinks.length === 0 ? (
              <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
                まだリンクはありません。
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {customLinks.map((link, index) => (
                  <li key={link.id} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{link.name}</p>
                      <p className="truncate text-xs text-slate-400">{link.url}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => onMove(link.id, "up")}
                        disabled={index === 0}
                        aria-label={`${link.name}を上へ移動`}
                        className="flex min-h-11 items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(link.id, "down")}
                        disabled={index === customLinks.length - 1}
                        aria-label={`${link.name}を下へ移動`}
                        className="flex min-h-11 items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(link)}
                        aria-label={`${link.name}を編集`}
                        className="min-h-11 rounded-lg bg-blue-50 px-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        aria-label={`${link.name}を削除`}
                        className="min-h-11 rounded-lg bg-red-50 px-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
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
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [scrollIndex,  setScrollIndex]  = useState(0);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCustomLinkModalOpen, setIsCustomLinkModalOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const customLinkButtonRef = useRef<HTMLButtonElement | null>(null);

  const appLinks: DisplayAppLink[] = [
    ...apps.map((app) => ({ ...app, id: `fixed-${app.name}` })),
    ...customLinks.map((link) => ({
      ...link,
      color: DEFAULT_CUSTOM_LINK_COLOR,
      icon: "",
    })),
  ];

  const maxScrollIndex = Math.max(0, appLinks.length - VISIBLE_APP_COUNT);

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

  const visibleScrollIndex = Math.min(scrollIndex, maxScrollIndex);

  const handleAddCustomLink = (link: Omit<CustomLink, "id">) => {
    setCustomLinks((current) => [...current, { id: createCustomLinkId(), ...link }]);
  };

  const handleUpdateCustomLink = (id: string, link: Omit<CustomLink, "id">) => {
    setCustomLinks((current) => current.map((item) => (item.id === id ? { ...item, ...link } : item)));
  };

  const handleDeleteCustomLink = (id: string) => {
    setCustomLinks((current) => current.filter((item) => item.id !== id));
  };

  const handleMoveCustomLink = (id: string, direction: "up" | "down") => {
    setCustomLinks((current) => {
      const currentIndex = current.findIndex((item) => item.id === id);
      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
      return next;
    });
  };

  const handleCloseCustomLinkModal = () => {
    setIsCustomLinkModalOpen(false);
    requestAnimationFrame(() => customLinkButtonRef.current?.focus());
  };

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
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                aria-label="アカウントメニューを開く"
                aria-expanded={isAccountMenuOpen}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white bg-white/85 shadow-sm transition-transform hover:scale-105"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#ff5961] text-white">
                    <UserIcon />
                  </div>
                )}
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

        <div className="flex min-h-[calc(100vh-clamp(68px,8vw,96px))]">
          <aside className="flex w-[clamp(80px,9vw,120px)] shrink-0 items-center bg-gradient-to-b from-[#c7eef0] to-[#79bdea] px-3 py-2">
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={() => setScrollIndex((i) => Math.max(0, Math.min(i, maxScrollIndex) - 1))}
                disabled={visibleScrollIndex === 0}
                className="flex h-7 w-full justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible"
                aria-label="上へスクロール"
              >
                ⋀
              </button>

              <div className="w-full overflow-hidden" style={{ height: VISIBLE_APP_COUNT * ITEM_STEP_PX }}>
                <div
                  className="flex flex-col items-center transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateY(-${visibleScrollIndex * ITEM_STEP_PX}px)` }}
                >
                  <div className="flex flex-col gap-3">
                    {appLinks.map((app) => (
                      <a
                        key={app.id}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={app.name}
                        aria-label={app.name}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center transition-transform hover:scale-110"
                      >
                        {app.icon ? (
                          <Image
                            src={app.icon}
                            alt={app.name}
                            width={52}
                            height={52}
                            className="h-[52px] w-[52px] rounded-xl border-2 border-white bg-white object-contain"
                          />
                        ) : (
                          <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl border-2 border-white ${app.color} text-xl font-bold text-[#247fc1] shadow-sm`}>
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
                onClick={() => setScrollIndex((i) => Math.min(maxScrollIndex, Math.min(i, maxScrollIndex) + 1))}
                disabled={visibleScrollIndex === maxScrollIndex}
                className="flex h-7 w-full justify-center rounded-full text-lg font-bold leading-6 text-white hover:bg-white/20 disabled:invisible"
                aria-label="下へスクロール"
              >
                ⋁
              </button>
              <button
                ref={customLinkButtonRef}
                type="button"
                onClick={() => setIsCustomLinkModalOpen(true)}
                aria-label="カスタムリンクを管理"
                className="flex h-[52px] w-[52px] items-center justify-center self-center rounded-full border-2 border-white pb-1 text-4xl font-light leading-none text-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#79bdea]"
              >
                +
              </button>
            </div>
          </aside>

          {isCustomLinkModalOpen && (
            <CustomLinkModal
              customLinks={customLinks}
              onAdd={handleAddCustomLink}
              onUpdate={handleUpdateCustomLink}
              onDelete={handleDeleteCustomLink}
              onMove={handleMoveCustomLink}
              onClose={handleCloseCustomLinkModal}
            />
          )}

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

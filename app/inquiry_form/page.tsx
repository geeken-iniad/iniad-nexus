import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "../components/inquiry/InquiryForm";

export const metadata: Metadata = {
  title: "お問い合わせ | INIAD Nexus",
  description: "INIAD Nexusのお問い合わせフォームです。",
};

export default function InquiryFormPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f3ff_0%,#f7fbff_34%,#eef5ff_68%,#e6f1ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#247fc1]">INIAD NEXUS</p>
            <h1 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">お問い合わせ</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Homeへ戻る
          </Link>
        </div>

        <div className="flex justify-center">
          <InquiryForm />
        </div>
      </div>
    </main>
  );
}
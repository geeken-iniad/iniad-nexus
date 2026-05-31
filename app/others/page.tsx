import BottomNav from "../components/BottomNav";
import Link from "next/link"; // ← これを追加！

export default function OthersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EBF4FA] via-[#D0E2FF] to-[#C1DBFE] p-6 pb-24 text-gray-800 flex flex-col items-center justify-center">
      
      {/* ガラス風のカード */}
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/60 p-10 text-center backdrop-blur-md shadow-sm max-w-sm w-full mx-auto">
        <div className="text-6xl mb-2">🚀</div>
        <h1 className="text-2xl font-bold text-slate-800">Coming Soon!</h1>
        <p className="text-sm text-slate-600 leading-relaxed mt-2">
          このページは現在開発中です。<br />
          フレンド機能や課題登録など、<br />
          今後の新機能追加を楽しみにお待ちください！
        </p>

        {/* ホームに戻るボタンをカード内に追加 */}
        <Link 
          href="/"
          className="mt-4 rounded-2xl bg-white/80 border border-white/60 px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-white hover:scale-105 active:scale-95"
        >
          ← Homeに戻る
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}
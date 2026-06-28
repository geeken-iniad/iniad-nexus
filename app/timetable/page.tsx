import TimetableGrid from '@/app/components/timetable/TimetableGrid'
import Link from 'next/link';

export const metadata = {
  title: 'INIAD Nexus',
}

export default function TimetablePage() {
  return (
    <main className="flex h-screen flex-col bg-gradient-to-br from-[#d7eadc] via-[#c9e9e6] to-[#17c1ce] px-4 py-6 text-[#32323b] sm:px-8">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col rounded-[28px] bg-white/24 p-[clamp(16px,3vw,32px)] shadow-[0_24px_70px_-36px_rgba(25,70,91,0.65)] backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-800">時間割</h1>
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-[#d5f3e8] to-[#88c9f5] px-4 py-2 text-xs font-bold text-[#2d6770] shadow-sm transition-transform duration-200 hover:scale-105"
          >
            ← Home
          </Link>
        </div>
        <div className="min-h-0 flex-1 rounded-[24px] bg-white/62 p-4 shadow-sm backdrop-blur-md">
          <TimetableGrid />
        </div>
        
      </div>
    </main>
  )
}

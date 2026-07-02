import TimetableGrid from '@/app/components/timetable/TimetableGrid'
import Link from 'next/link';

export const metadata = {
  title: 'INIAD Nexus',
}

export default function TimetablePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-[#d7eadc] via-[#c9e9e6] to-[#17c1ce] px-2 py-3 text-[#32323b] sm:px-4 sm:py-6 md:h-screen md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-1 flex-col rounded-[22px] bg-white/24 p-3 shadow-[0_24px_70px_-36px_rgba(25,70,91,0.65)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:p-[clamp(16px,3vw,32px)] sm:rounded-[28px] md:min-h-0">
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl bg-white/70 px-3 py-3 shadow-sm backdrop-blur-md sm:mb-4 sm:px-4">
          <h1 className="text-lg font-extrabold tracking-tight text-slate-800">時間割</h1>
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-[#d5f3e8] to-[#88c9f5] px-4 py-2 text-xs font-bold text-[#2d6770] shadow-sm transition-transform duration-200 hover:scale-105"
          >
            ← Home
          </Link>
        </div>
        <div className="min-h-[640px] flex-1 rounded-[20px] bg-white/62 p-3 shadow-sm backdrop-blur-md sm:rounded-[24px] sm:p-4 md:min-h-0">
          <TimetableGrid />
        </div>
        
      </div>
    </main>
  )
}

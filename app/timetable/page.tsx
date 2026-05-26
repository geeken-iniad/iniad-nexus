import TimetableGrid from '@/app/components/timetable/TimetableGrid'
import Link from 'next/link';

export const metadata = {
  title: 'INIAD Nexas',
}

export default function TimetablePage() {
  return (
    <main className="h-screen bg-slate-50 px-4 py-6 sm:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 min-h-0 mt-4">
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">時間割</h1>
          <Link
            href="/"
            className="text-gray-400 hover:text-slate-800 transition-colors duration-200 text-xs"
          >
            ← Home
          </Link>
        </div>
        <div className="flex-1 min-h-0">
          <TimetableGrid />
        </div>
        
      </div>
    </main>
  )
}
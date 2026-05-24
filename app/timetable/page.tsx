import TimetableGrid from '@/components/timetable/TimetableGrid'

export const metadata = {
  title: '時間割 | INIAD Nexas',
}

export default function TimetablePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* ページヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">時間割</h1>
          <p className="text-sm text-slate-400 mt-1">
            コマをタップして科目を追加・編集できます
          </p>
        </div>

        <TimetableGrid />
      </div>
    </main>
  )
}

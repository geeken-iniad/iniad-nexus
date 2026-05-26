'use client'

import type { TimetableEntry } from '@/types/timetable'

interface Props {
  entry: TimetableEntry | undefined
  onClick: () => void
}

export default function SubjectCell({ entry, onClick }: Props) {
  const bg = entry?.color ?? null

  return (
    <button
      onClick={onClick}
      className={[
        'group relative w-full h-full min-h-[5.5rem] rounded-xl border transition-all duration-200',
        'flex flex-col gap-1 p-2 text-left overflow-hidden',
        entry
          ? 'border-transparent shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.99]'
          : 'border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100',
      ].join(' ')}
      style={entry && bg ? { backgroundColor: bg + '22', borderColor: bg + '66' } : undefined}
      aria-label={entry ? entry.subject : '科目を追加'}
    >
      {entry ? (
        <>
          {/* カラーバー */}
          <span
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
            style={{ backgroundColor: bg ?? '#94a3b8' }}
          />
          <span className="pl-2 text-[0.72rem] font-bold leading-tight text-slate-800 line-clamp-2">
            {entry.subject}
          </span>
          {entry.classroom && (
            <span className="pl-2 text-[0.65rem] text-slate-500 truncate">
               {entry.classroom}
            </span>
          )}
          {entry.teacher && (
            <span className="pl-2 text-[0.65rem] text-slate-500 truncate">
               {entry.teacher}
            </span>
          )}
        </>
      ) : (
        <span className="m-auto text-xl text-slate-300 group-hover:text-slate-400 transition-colors select-none">
          +
        </span>
      )}
    </button>
  )
}

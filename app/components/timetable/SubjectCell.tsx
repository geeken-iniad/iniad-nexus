'use client'

import type { TimetableEntry } from '@/types/timetable'

interface Props {
  entry: TimetableEntry | undefined
  onClick: () => void
}

export default function SubjectCell({ entry, onClick }: Props) {
  const bg = entry?.color ?? null
  const subjectTextClass = entry && entry.subject.length > 18
    ? 'text-[0.72rem] landscape:min-[900px]:text-sm'
    : entry && entry.subject.length > 10
      ? 'text-[0.82rem] landscape:min-[900px]:text-[0.92rem]'
      : 'text-[clamp(0.9rem,2.4vw,1.35rem)] landscape:min-[900px]:text-base'

  return (
    <button
      onClick={onClick}
      className={[
        'group relative w-full h-full rounded-xl border transition-all duration-200',
        'flex flex-col gap-1 p-1.5 sm:p-2 text-left overflow-hidden',
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
          <span className={`break-words pl-2 font-extrabold leading-[1.05] text-slate-800 ${subjectTextClass}`}>
            {entry.subject}
          </span>
          {entry.classroom && (
            <span className="pl-2 text-[0.7rem] font-medium text-slate-500 truncate landscape:min-[900px]:text-xs">
               {entry.classroom}
            </span>
          )}
          {entry.teacher && (
            <span className="pl-2 text-[0.7rem] font-medium text-slate-500 truncate landscape:min-[900px]:text-xs">
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

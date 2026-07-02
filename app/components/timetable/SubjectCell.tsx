'use client'

import type { TimetableEntry } from '@/types/timetable'

interface Props {
  entry: TimetableEntry | undefined
  onClick: () => void
}

export default function SubjectCell({ entry, onClick }: Props) {
  const bg = entry?.color ?? null
  const subjectTextClass = entry && entry.subject.length > 18
    ? 'text-[0.64rem] sm:text-[0.78rem] landscape:min-[900px]:text-sm'
    : entry && entry.subject.length > 10
      ? 'text-[0.7rem] sm:text-[0.88rem] landscape:min-[900px]:text-[0.92rem]'
      : 'text-[0.78rem] sm:text-[1rem] landscape:min-[900px]:text-base'

  return (
    <button
      onClick={onClick}
      className={[
        'group relative w-full h-full rounded-xl border transition-all duration-200',
        'flex flex-col justify-start gap-0.5 p-1.5 sm:gap-1 sm:p-2 text-left overflow-hidden',
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
          <span className={`line-clamp-3 break-words pl-2 font-bold leading-[1.12] tracking-[-0.01em] text-slate-800 sm:font-black sm:leading-[1.08] sm:text-slate-900 ${subjectTextClass}`}>
            {entry.subject}
          </span>
          {entry.classroom && (
            <span className="truncate pl-2 text-[0.58rem] font-normal leading-tight text-slate-500 sm:text-[0.72rem] sm:font-semibold sm:text-slate-600 landscape:min-[900px]:text-xs">
               {entry.classroom}
            </span>
          )}
          {entry.teacher && (
            <span className="truncate pl-2 text-[0.58rem] font-normal leading-tight text-slate-500 sm:text-[0.72rem] sm:font-semibold landscape:min-[900px]:text-xs">
               {entry.teacher}
            </span>
          )}
        </>
      ) : (
        <span className="m-auto text-lg font-bold text-slate-300 transition-colors select-none group-hover:text-slate-400 sm:text-xl">
          +
        </span>
      )}
    </button>
  )
}

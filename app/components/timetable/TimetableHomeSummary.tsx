'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { SemesterType, TimetableEntry } from '@/types/timetable'
import { currentAcademicYear, DAYS, PERIODS } from '@/types/timetable'
import { fetchTimetable } from '@/utils/supabase/timetable'

const HOME_DAYS = [...DAYS,] as const
const DOT_COLORS = ['#b9a5ae', '#9a7899', '#846188', '#efd483', '#e8c177', '#dda068', '#d98242']

/** 現在の学期を4月〜9月=spring、10月〜3月=fall で判定 */
function currentSemester(): SemesterType {
  return new Date().getMonth() < 9 ? 'spring' : 'fall'
}

export default function TimetableHomeSummary() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)

  const year     = currentAcademicYear()
  const semester = currentSemester()

  useEffect(() => {
    fetchTimetable(year, semester)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [year, semester])

  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>()
    for (const e of entries) map.set(`${e.day_of_week}-${e.period}`, e)
    return map
  }, [entries])

  // 今日の曜日（月=0〜金=4、土日=-1）
  const todayDow = (() => {
    const d = new Date().getDay()
    return d >= 1 && d <= 5 ? d - 1 : -1
  })()

  return (
    
    <div className="relative flex min-h-[clamp(520px,66vh,720px)] w-full flex-col rounded-[1.6rem] bg-[#eef8f5]/80 p-5 shadow-sm backdrop-blur-md md:p-7">
      <div className="absolute left-5 top-5 z-10 md:left-7 md:top-7">
      {/* サブヘッダー */}
      <div className="mb-1 text-[10px] font-bold tracking-[0.15em] text-slate-400">
        SCHEDULE
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800">時間割</h2>
      <Link
        href="/timetable"
        className="mt-3 inline-flex w-fit rounded-lg bg-[#58d7d2] px-3 py-1.5 text-base font-bold leading-none text-[#2d6770] shadow-sm transition-transform hover:scale-105"
      >
        +登録
      </Link>
      </div>

      {/* グリッド */}
      <div className="flex min-h-0 flex-1 justify-end overflow-hidden">
        <div className="h-full w-[min(86%,820px)]">
        <table className="h-full w-full table-fixed border-collapse">
          <colgroup>
            {/* 時限列 */}
            <col className="w-[1.8rem]" />
            {DAYS.map((_, i) => <col key={i} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="pb-1" />
              {DAYS.map((day, i) => (
                <th
                  key={i}
                  className={[
                    'pb-2 text-center text-[0.82rem] font-extrabold',
                    todayDow === i ? 'text-[#2785bf]' : 'text-[#44444d]',
                  ].join(' ')}
                >
                  {day}
                  {todayDow === i && (
                    <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#2785bf]" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period}>
                {/* 時限番号 */}
                <td className="text-center align-middle">
                  <span className="text-[0.72rem] font-extrabold text-gray-600">{period}</span>
                </td>

                {DAYS.map((_, day) => {
                  const entry = entryMap.get(`${day}-${period}`)
                  const isToday = todayDow === day
                  return (
                    <td key={day} className="p-[3px]">
                      {loading ? (
                      <div className="h-full min-h-[clamp(4.9rem,9vh,6.4rem)] animate-pulse rounded-lg bg-white/60" />
                    ) : entry ? (
                      <div
                        className={[
                            'flex h-full min-h-[clamp(4.9rem,9vh,6.4rem)] flex-col justify-center overflow-hidden rounded-lg border border-white/70 px-1.5 py-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]',
                            isToday ? 'ring-2 ring-blue-300/50' : '',
                          ].join(' ')}
                          style={{
                            backgroundColor: entry.color ? entry.color + '25' : '#f1f5f9',
                            color: entry.color ? entry.color : '#334155'
                          }}
                        >
                          <span className="line-clamp-2 text-[0.68rem] font-extrabold leading-tight">
                            {entry.subject}
                          </span>
                          {entry.classroom && (
                            <span className="mt-0.5 truncate text-[0.6rem] font-medium leading-tight opacity-80">
                              {entry.classroom}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={[
                            'h-full min-h-[clamp(4.9rem,9vh,6.4rem)] rounded-lg border border-slate-200/70 bg-white/48 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]',
                            isToday ? 'bg-[#ecfbfa]' : '',
                          ].join(' ')}
                        />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

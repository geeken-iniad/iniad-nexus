'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { SemesterType, TimetableEntry } from '@/types/timetable'
import { currentAcademicYear, DAYS, PERIODS } from '@/types/timetable'
import { fetchTimetable } from '@/utils/supabase/timetable'

const HOME_DAYS = [...DAYS, '土', '日'] as const
const DOT_COLORS = ['#b9a5ae', '#9a7899', '#846188', '#efd483', '#e8c177', '#dda068', '#d98242']
const PERIOD_TIMES: Record<number, string> = {
  1: '9:00-10:30',
  2: '10:40-12:10',
  3: '13:00-14:30',
  4: '14:45-16:15',
  5: '16:30-18:00',
  6: '18:15-19:45',
}

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

  const subjectTextClass = (subject: string) => {
    if (subject.length > 18) return 'text-[0.68rem] landscape:min-[900px]:text-[0.78rem]'
    if (subject.length > 10) return 'text-[0.82rem] landscape:min-[900px]:text-[0.88rem]'
    return 'text-[clamp(1rem,3.2vw,1.55rem)] landscape:min-[900px]:text-[0.95rem]'
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {/* サブヘッダー */}
      <div className="sr-only">
        <span>
          {year}年度 {semester === 'spring' ? '春学期' : '秋学期'}
        </span>
        <Link href="/timetable">
          時間割ページへ →
        </Link>
      </div>

      {/* グリッド */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="h-full w-full table-fixed border-collapse">
          <colgroup>
            {/* 時限列 */}
            <col className="w-[2.7rem] min-[700px]:w-[4.5rem] landscape:min-[900px]:w-[5.4rem]" />
            {HOME_DAYS.map((_, i) => <col key={i} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="pb-1" />
              {HOME_DAYS.map((day, i) => (
                <th
                  key={i}
                  className={[
                    'pb-1 text-center text-[0.62rem] font-extrabold min-[700px]:text-[0.9rem] landscape:min-[900px]:pb-2 landscape:min-[900px]:text-base',
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
                <td className="px-0.5 text-center align-middle">
                  <span className="block text-[0.58rem] font-extrabold text-gray-600 min-[700px]:text-[0.82rem] landscape:min-[900px]:text-sm">
                    {period}限
                  </span>
                  <span className="mt-0.5 block text-[0.4rem] font-semibold leading-tight text-gray-400 min-[700px]:text-[0.62rem] landscape:min-[900px]:text-[0.7rem]">
                    {PERIOD_TIMES[period]}
                  </span>
                </td>

                {HOME_DAYS.map((_, day) => {
                  const entry = entryMap.get(`${day}-${period}`)
                  const isToday = todayDow === day
                  return (
                    <td key={day} className="border border-[#b8c2cc] p-px landscape:min-[900px]:border-2 landscape:min-[900px]:p-[3px]">
                      {loading ? (
                        <div className="h-full min-h-[2.2rem] animate-pulse rounded bg-gray-100" />
                      ) : entry ? (
                        <div
                          className={[
                            'flex h-full min-h-[2.2rem] flex-col justify-center overflow-hidden rounded-md px-1 py-0.5 landscape:min-[900px]:rounded-xl landscape:min-[900px]:px-1.5 landscape:min-[900px]:py-1',
                            isToday ? 'ring-1 ring-blue-400/40' : '',
                          ].join(' ')}
                          style={{
                            backgroundColor: entry.color ? entry.color + '22' : 'rgba(255,255,255,0.06)',
                            borderLeft: `2px solid ${entry.color ?? '#94a3b8'}`,
                          }}
                        >
                          <span className={`break-words font-extrabold leading-[1.05] text-[#3e4650] landscape:min-[900px]:leading-tight ${subjectTextClass(entry.subject)}`}>
                            {entry.subject}
                          </span>
                          {entry.classroom && (
                            <span className="hidden truncate text-[0.7rem] font-semibold leading-tight text-gray-500 landscape:min-[900px]:block">
                              {entry.classroom}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={[
                            'relative h-full min-h-[2.2rem]',
                            isToday ? 'bg-[#eefbfa]' : 'bg-white',
                          ].join(' ')}
                        >
                          <span
                            className="absolute left-0.5 top-0.5 h-2 w-2 rounded-full ring-1 ring-white landscape:min-[900px]:left-1 landscape:min-[900px]:top-1 landscape:min-[900px]:h-2.5 landscape:min-[900px]:w-2.5"
                            style={{ backgroundColor: DOT_COLORS[(day + period - 1) % DOT_COLORS.length] }}
                          />
                        </div>
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
  )
}

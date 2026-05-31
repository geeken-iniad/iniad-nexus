'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { SemesterType, TimetableEntry } from '@/types/timetable'
import { currentAcademicYear, DAYS, PERIODS } from '@/types/timetable'
import { fetchTimetable } from '@/utils/supabase/timetable'

const HOME_DAYS = [...DAYS, '土', '日'] as const
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
            <col className="w-[1.8rem]" />
            {HOME_DAYS.map((_, i) => <col key={i} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="pb-1" />
              {HOME_DAYS.map((day, i) => (
                <th
                  key={i}
                  className={[
                    'pb-2 text-center text-[0.78rem] font-extrabold',
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

                {HOME_DAYS.map((_, day) => {
                  const entry = entryMap.get(`${day}-${period}`)
                  const isToday = todayDow === day
                  return (
                    <td key={day} className="border-2 border-[#b8c2cc] p-[3px]">
                      {loading ? (
                        <div className="h-full min-h-[2.2rem] animate-pulse rounded bg-gray-100" />
                      ) : entry ? (
                        <div
                          className={[
                            'flex h-full min-h-[2.2rem] flex-col justify-center overflow-hidden rounded-xl px-1.5 py-1',
                            isToday ? 'ring-1 ring-blue-400/40' : '',
                          ].join(' ')}
                          style={{
                            backgroundColor: entry.color ? entry.color + '22' : 'rgba(255,255,255,0.06)',
                            borderLeft: `2px solid ${entry.color ?? '#94a3b8'}`,
                          }}
                        >
                          <span className="line-clamp-2 text-[0.68rem] font-extrabold leading-tight text-[#3e4650]">
                            {entry.subject}
                          </span>
                          {entry.classroom && (
                            <span className="truncate text-[0.6rem] font-semibold leading-tight text-gray-500">
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
                            className="absolute left-1 top-1 h-2.5 w-2.5 rounded-full ring-1 ring-white"
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

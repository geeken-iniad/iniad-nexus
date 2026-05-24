'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SemesterType, TimetableEntry, TimetableInsert } from '@/types/timetable'
import { DAYS, PERIODS } from '@/types/timetable'
import {
  addTimetableEntry,
  deleteTimetableEntry,
  fetchTimetable,
  updateTimetableEntry,
} from '@/utils/supabase/timetable'
import SubjectCell from './SubjectCell'
import SubjectModal from './SubjectModal'

interface ModalState {
  entry?: TimetableEntry
  initialCell?: { day_of_week: number; period: number; semester: SemesterType }
}

/** 時間帯ラベル*/
const PERIOD_TIMES: Record<number, string> = {
  1: '09:00',
  2: '10:40',
  3: '13:10',
  4: '14:50',
  5: '16:30',
  6: '18:10',
}

export default function TimetableGrid() {
  const [semester,   setSemester]   = useState<SemesterType>('spring')
  const [entries,    setEntries]    = useState<TimetableEntry[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState | null>(null)

  // -----------------------------------------------------------------
  // データ取得
  // -----------------------------------------------------------------
  const load = useCallback(async (sem: SemesterType) => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await fetchTimetable(sem))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(semester) }, [semester, load])

  // -----------------------------------------------------------------
  // セルへのエントリマップ
  // -----------------------------------------------------------------
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>()
    for (const e of entries) map.set(`${e.day_of_week}-${e.period}`, e)
    return map
  }, [entries])

  // -----------------------------------------------------------------
  // CRUD ハンドラ
  // -----------------------------------------------------------------
  const handleSave = async (data: TimetableInsert) => {
    if (modalState?.entry) {
      // 更新
      const updated = await updateTimetableEntry(modalState.entry.id, data)
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      // 追加
      const added = await addTimetableEntry(data)
      setEntries((prev) => [...prev, added])
    }
  }

  const handleDelete = async () => {
    if (!modalState?.entry) return
    await deleteTimetableEntry(modalState.entry.id)
    setEntries((prev) => prev.filter((e) => e.id !== modalState.entry!.id))
  }

  // -----------------------------------------------------------------
  // セルクリック
  // -----------------------------------------------------------------
  const openCell = (day_of_week: number, period: number) => {
    const entry = entryMap.get(`${day_of_week}-${period}`)
    setModalState(entry ? { entry } : { initialCell: { day_of_week, period, semester } })
  }

  // -----------------------------------------------------------------
  // 現在の曜日ハイライト
  // -----------------------------------------------------------------
  const todayDow = (() => {
    const d = new Date().getDay() // 0=日〜6=土
    return d >= 1 && d <= 5 ? d - 1 : -1  // 月=0〜金=4
  })()

  // -----------------------------------------------------------------
  // レンダリング
  // -----------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {/* セメスタータブ */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(['spring', 'fall'] as const).map((sem) => (
          <button
            key={sem}
            onClick={() => setSemester(sem)}
            className={[
              'px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150',
              semester === sem
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {sem === 'spring' ? '🌸 春学期' : '🍂 秋学期'}
          </button>
        ))}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
          <button onClick={() => load(semester)} className="ml-3 underline">再読み込み</button>
        </div>
      )}

      {/* グリッド */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
        <table className="w-full border-collapse table-fixed min-w-[560px]">
          <colgroup>
            <col className="w-[3.5rem]" />
            {DAYS.map((_, i) => <col key={i} />)}
          </colgroup>
          <thead>
            <tr>
              {/* 左上空白 */}
              <th className="border-b border-slate-100 py-2" />
              {DAYS.map((day, i) => (
                <th
                  key={i}
                  className={[
                    'border-b border-slate-100 py-2 text-center text-sm font-bold',
                    todayDow === i ? 'text-blue-500' : 'text-slate-600',
                  ].join(' ')}
                >
                  {day}
                  {todayDow === i && (
                    <span className="block mx-auto mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="group/row">
                {/* 時限ラベル */}
                <td className="border-b border-slate-100 py-1 px-1 text-center align-top">
                  <span className="block text-xs font-bold text-slate-600">{period}</span>
                  <span className="block text-[0.6rem] text-slate-300 leading-none mt-0.5">
                    {PERIOD_TIMES[period]}
                  </span>
                </td>

                {/* 各曜日のセル */}
                {DAYS.map((_, day) => (
                  <td
                    key={day}
                    className={[
                      'border-b border-slate-100 p-1',
                      todayDow === day ? 'bg-blue-50/40' : '',
                    ].join(' ')}
                  >
                    {loading ? (
                      <div className="min-h-[5.5rem] rounded-xl bg-slate-100 animate-pulse" />
                    ) : (
                      <SubjectCell
                        entry={entryMap.get(`${day}-${period}`)}
                        onClick={() => openCell(day, period)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モーダル */}
      {modalState && (
        <SubjectModal
          entry={modalState.entry}
          initialCell={modalState.initialCell}
          onSave={handleSave}
          onDelete={modalState.entry ? handleDelete : undefined}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  )
}

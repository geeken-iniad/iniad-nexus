'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SemesterType, TimetableEntry, TimetableInsert } from '@/types/timetable'
import { buildYearRange, currentAcademicYear, DAYS, gradeLabel, PERIODS } from '@/types/timetable'
import {
  addTimetableEntry,
  deleteTimetableEntry,
  fetchEnrollmentYear,
  fetchTimetable,
  updateTimetableEntry,
} from '@/utils/supabase/timetable'
import SubjectCell from './SubjectCell'
import SubjectModal from './SubjectModal'

interface ModalState {
  entry?: TimetableEntry
  initialCell?: { day_of_week: number; period: number; semester: SemesterType; academic_year: number }
}

const PERIOD_TIMES: Record<number, string> = {
  1: '09:00-10:30',
  2: '10:40-12:10',
  3: '13:00-14:30',
  4: '14:45-16:15',
  5: '16:30-18:00',
  6: '18:15-19:45',
}

export default function TimetableGrid() {
  const [academicYear,    setAcademicYear]    = useState<number>(currentAcademicYear())
  const [semester,        setSemester]        = useState<SemesterType>('spring')
  const [enrollmentYear,  setEnrollmentYear]  = useState<number | null>(null)
  const [entries,         setEntries]         = useState<TimetableEntry[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [modalState,      setModalState]      = useState<ModalState | null>(null)

  // 入学年度を取得（enrollment_year が profiles にない場合は null → 推定値で代替）
  useEffect(() => {
    fetchEnrollmentYear().then(setEnrollmentYear).catch(() => setEnrollmentYear(null))
  }, [])

  const effectiveEnrollmentYear = enrollmentYear ?? currentAcademicYear() - 3
  const yearRange = buildYearRange(enrollmentYear)

  // -----------------------------------------------------------------
  // データ取得
  // -----------------------------------------------------------------
  const load = useCallback(async (year: number, sem: SemesterType) => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await fetchTimetable(year, sem))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(academicYear, semester) }, [academicYear, semester, load])

  // -----------------------------------------------------------------
  // 年度変更（卒業後の確認ポップアップ付き）
  // -----------------------------------------------------------------
  const handleYearChange = (year: number) => {
    const isAfterGraduation = year >= effectiveEnrollmentYear + 4
    if (isAfterGraduation) {
      const label = gradeLabel(year, effectiveEnrollmentYear)
      if (!confirm(`${label}の時間割を表示・編集しますか？\n（卒業後の年度です）`)) return
    }
    setAcademicYear(year)
  }

  // -----------------------------------------------------------------
  // セルマップ
  // -----------------------------------------------------------------
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>()
    for (const e of entries) map.set(`${e.day_of_week}-${e.period}`, e)
    return map
  }, [entries])

  // -----------------------------------------------------------------
  // CRUD
  // -----------------------------------------------------------------
  const handleSave = async (data: TimetableInsert) => {
    if (modalState?.entry) {
      const updated = await updateTimetableEntry(modalState.entry.id, data)
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      const added = await addTimetableEntry(data)
      setEntries((prev) => [...prev, added])
    }
  }

  const handleDelete = async () => {
    if (!modalState?.entry) return
    await deleteTimetableEntry(modalState.entry.id)
    setEntries((prev) => prev.filter((e) => e.id !== modalState.entry!.id))
  }

  const openCell = (day_of_week: number, period: number) => {
    const entry = entryMap.get(`${day_of_week}-${period}`)
    setModalState(entry
      ? { entry }
      : { initialCell: { day_of_week, period, semester, academic_year: academicYear } }
    )
  }

  // 今日の曜日ハイライト
  const todayDow = (() => {
    const d = new Date().getDay()
    return d >= 1 && d <= 5 ? d - 1 : -1
  })()

  // -----------------------------------------------------------------
  // レンダリング
  // -----------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3 h-full">

      {/* ── コントロール行 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">

        {/* 年度セレクター */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0 scrollbar-none">
          {yearRange.map((year) => {
            const isAfterGrad = year >= effectiveEnrollmentYear + 4
            const isSelected  = year === academicYear
            return (
              <button
                key={year}
                onClick={() => handleYearChange(year)}
                className={[
                  'px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0',
                  isSelected
                    ? 'bg-white text-slate-800 shadow-sm'
                    : isAfterGrad
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {year}
                {/* 卒業後の年度には小さいバッジ */}
                {isAfterGrad && (
                  <span className="ml-1 text-[0.55rem] text-slate-400">卒後</span>
                )}
              </button>
            )
          })}
        </div>

        {/* 学期タブ */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit shrink-0">
          {(['spring', 'fall'] as const).map((sem) => (
            <button
              key={sem}
              onClick={() => setSemester(sem)}
              className={[
                'px-4 py-1 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap',
                semester === sem
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {sem === 'spring' ? '🌸 春学期' : '🍂 秋学期'}
            </button>
          ))}
        </div>

        {/* 選択中のラベル（年次表示） */}
        <span className="text-xs text-slate-400 sm:ml-auto">
          {gradeLabel(academicYear, effectiveEnrollmentYear)}
        </span>
      </div>

      {/* エラー */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
          <button onClick={() => load(academicYear, semester)} className="ml-3 underline">
            再読み込み
          </button>
        </div>
      )}

      {/* グリッド */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white flex-1 min-h-0">
        <table className="w-full border-collapse table-fixed min-w-[340px] sm:min-w-[560px] h-full">
          <colgroup>
            <col className="w-[2.2rem] sm:w-[3.5rem]" />
            {DAYS.map((_, i) => <col key={i} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="border-b border-slate-100 py-2" />
              {DAYS.map((day, i) => (
                <th
                  key={i}
                  className={[
                    'border-b border-slate-100 py-1 sm:py-2 text-center text-xs sm:text-sm font-bold',
                    todayDow === i ? 'text-blue-500' : 'text-slate-600',
                  ].join(' ')}
                >
                  {day}
                  {todayDow === i && (
                    <span className="block mx-auto mt-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period}>
                <td className="border-b border-slate-100 py-1 px-0.5 text-center align-top">
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-600">{period}</span>
                  <span className="hidden sm:block text-[0.55rem] sm:text-[0.6rem] text-slate-300 leading-none mt-0.5">
                    {PERIOD_TIMES[period]}
                  </span>
                </td>
                {DAYS.map((_, day) => (
                  <td
                    key={day}
                    className={[
                      'border-b border-slate-100 p-0.5 sm:p-1',
                      todayDow === day ? 'bg-blue-50/40' : '',
                    ].join(' ')}
                  >
                    {loading ? (
                      <div className="min-h-[4.5rem] sm:min-h-[5.5rem] rounded-xl bg-slate-100 animate-pulse" />
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
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

interface YearSemesterOption {
  academic_year: number
  semester: SemesterType
  isAfterGrad: boolean
}

function buildOptions(yearRange: number[], enrollmentYear: number): YearSemesterOption[] {
  const options: YearSemesterOption[] = []
  for (const year of yearRange) {
    for (const sem of ['spring', 'fall'] as SemesterType[]) {
      options.push({ academic_year: year, semester: sem, isAfterGrad: year >= enrollmentYear + 4 })
    }
  }
  return options
}

export default function TimetableGrid() {
  const [academicYear,   setAcademicYear]   = useState<number>(currentAcademicYear())
  const [semester,       setSemester]       = useState<SemesterType>('spring')
  const [enrollmentYear, setEnrollmentYear] = useState<number | null>(null)
  const [entries,        setEntries]        = useState<TimetableEntry[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [modalState,     setModalState]     = useState<ModalState | null>(null)
  const [dropdownOpen,   setDropdownOpen]   = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEnrollmentYear().then(setEnrollmentYear).catch(() => setEnrollmentYear(null))
  }, [])

  const effectiveEnrollmentYear = enrollmentYear ?? currentAcademicYear() - 3
  const yearRange = buildYearRange(enrollmentYear)

  const selectedLabel = `${academicYear}年度 ${semester === 'spring' ? '春学期' : '秋学期'}`

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // データ取得
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

  // 年度・学期の選択
  const handleSelect = (opt: YearSemesterOption) => {
    if (opt.isAfterGrad) {
      if (!confirm(`${opt.academic_year}年度は卒業後の年度です。表示しますか？`)) return
    }
    setAcademicYear(opt.academic_year)
    setSemester(opt.semester)
    setDropdownOpen(false)
  }

  // セルマップ・CRUD
  const entryMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>()
    for (const e of entries) map.set(`${e.day_of_week}-${e.period}`, e)
    return map
  }, [entries])

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

  const todayDow = (() => {
    const d = new Date().getDay()
    return d >= 1 && d <= 5 ? d - 1 : -1
  })()

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* セレクター行 */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <span>{selectedLabel}</span>
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden min-w-[200px]">
              {yearRange.map((year) => (
                <div key={year}>
                  {/* 年度グループヘッダー */}
                  <div className="px-3 pt-2.5 pb-1 text-[0.65rem] font-bold text-slate-400 tracking-wide border-t border-slate-50 first:border-t-0">
                    {gradeLabel(year, effectiveEnrollmentYear)}
                  </div>
                  {/* 春・秋 */}
                  {(['spring', 'fall'] as SemesterType[]).map((sem) => {
                    const isSelected  = year === academicYear && sem === semester
                    const isAfterGrad = year >= effectiveEnrollmentYear + 4
                    return (
                      <button
                        key={sem}
                        onClick={() => handleSelect({ academic_year: year, semester: sem, isAfterGrad })}
                        className={[
                          'w-full text-left px-5 py-2 text-xs font-medium transition-colors flex items-center justify-between',
                          isSelected
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : isAfterGrad
                              ? 'text-slate-400 hover:bg-slate-50'
                              : 'text-slate-700 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <span>
                          {sem === 'spring' ? '春学期' : '秋学期'}
                          {isAfterGrad && <span className="ml-1.5 text-[0.6rem] text-slate-400">卒後</span>}
                        </span>
                        {isSelected && <span className="text-blue-400 text-[0.7rem]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 年次ラベル */}
        <span className="text-xs text-slate-400 ml-auto">
          {gradeLabel(academicYear, effectiveEnrollmentYear)}
        </span>
      </div>

      {/* エラー */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
          <button onClick={() => load(academicYear, semester)} className="ml-3 underline">再読み込み</button>
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
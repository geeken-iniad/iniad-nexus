'use client'

import { useEffect, useRef, useState } from 'react'
import type { TimetableEntry, TimetableInsert } from '@/types/timetable'
import { DAYS, SUBJECT_COLORS } from '@/types/timetable'

interface Props {
  entry?: TimetableEntry
  /** 新規追加時の初期セル — academic_year を追加 */
  initialCell?: { day_of_week: number; period: number; semester: 'spring' | 'fall'; academic_year: number }
  onSave: (data: TimetableInsert) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

const DEFAULT_COLOR = SUBJECT_COLORS[0].value

export default function SubjectModal({ entry, initialCell, onSave, onDelete, onClose }: Props) {
  const [subject,   setSubject]   = useState(entry?.subject   ?? '')
  const [classroom, setClassroom] = useState(entry?.classroom ?? '')
  const [teacher,   setTeacher]   = useState(entry?.teacher   ?? '')
  const [note,      setNote]      = useState(entry?.note      ?? '')
  const [color,     setColor]     = useState(entry?.color     ?? DEFAULT_COLOR)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cellDayOfWeek  = entry?.day_of_week   ?? initialCell?.day_of_week   ?? 0
  const cellPeriod     = entry?.period         ?? initialCell?.period         ?? 1
  const semester       = entry?.semester       ?? initialCell?.semester       ?? 'spring'
  const academic_year  = entry?.academic_year  ?? initialCell?.academic_year  ?? new Date().getFullYear()

  const handleSave = async () => {
    if (!subject.trim()) { setError('科目名を入力してください'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        academic_year,
        semester,
        day_of_week: cellDayOfWeek,
        period:      cellPeriod,
        subject:     subject.trim(),
        classroom:   classroom.trim() || null,
        teacher:     teacher.trim()   || null,
        note:        note.trim()      || null,
        color,
      })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm(`「${entry?.subject}」を削除しますか？`)) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm md:max-xl:max-w-none md:max-xl:w-[calc(100vw-3rem)] landscape:max-xl:w-[calc(100vw-2rem)] landscape:max-xl:max-w-4xl landscape:max-xl:max-h-[calc(100vh-2rem)] landscape:max-xl:overflow-y-auto xl:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 md:px-7 pt-5 md:pt-7 landscape:max-xl:pt-4 pb-3 md:pb-4 landscape:max-xl:pb-3 flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-bold text-slate-800">
            {entry ? '科目を編集' : '科目を追加'}
            <span className="ml-2 text-sm md:text-base font-normal text-slate-400">
              {academic_year}年度 {semester === 'spring' ? '春' : '秋'}学期 {DAYS[cellDayOfWeek]}曜 {cellPeriod}限
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl md:text-3xl leading-none"
            aria-label="閉じる"
          >×</button>
        </div>

        <div className="px-5 md:px-7 pb-5 md:pb-7 landscape:max-xl:pb-4 space-y-3 md:space-y-4 landscape:max-xl:grid landscape:max-xl:grid-cols-2 landscape:max-xl:gap-x-4 landscape:max-xl:gap-y-3 landscape:max-xl:space-y-0">
          <div>
            <label className="block text-sm md:text-base font-semibold text-slate-500 mb-1">科目名 *</label>
            <input
              ref={inputRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              className="w-full rounded-lg border border-slate-200 px-3 md:px-4 py-2 md:py-3 landscape:max-xl:py-2 text-base md:text-lg text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 線形代数"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-slate-500 mb-1">教室</label>
            <input
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 md:px-4 py-2 md:py-3 landscape:max-xl:py-2 text-base md:text-lg text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 101教室"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-slate-500 mb-1">担当教員</label>
            <input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 md:px-4 py-2 md:py-3 landscape:max-xl:py-2 text-base md:text-lg text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 山田 太郎"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-slate-500 mb-1">メモ</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 md:px-4 py-2 md:py-3 landscape:max-xl:py-2 text-base md:text-lg text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="自由記入"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-semibold text-slate-500 mb-2">色</label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: color === c.value ? '#1e293b' : 'transparent',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 landscape:max-xl:col-span-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1 landscape:max-xl:col-span-2">
            {entry && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm md:text-base font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? '削除中…' : '削除'}
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 md:px-5 md:py-3 rounded-lg text-sm md:text-base font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-bold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

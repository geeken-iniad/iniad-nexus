'use client'

import { useEffect, useRef, useState } from 'react'
import type { TimetableEntry, TimetableInsert } from '@/types/timetable'
import { DAYS, PERIODS, SUBJECT_COLORS } from '@/types/timetable'

interface Props {
  /** 編集対象。undefined なら新規追加 */
  entry?: TimetableEntry
  /** 新規追加時の初期セル */
  initialCell?: { day_of_week: number; period: number; semester: 'spring' | 'fall' }
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

  // ESC で閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cellDayOfWeek = entry?.day_of_week ?? initialCell?.day_of_week ?? 0
  const cellPeriod    = entry?.period      ?? initialCell?.period      ?? 1
  const semester      = entry?.semester    ?? initialCell?.semester    ?? 'spring'

  const handleSave = async () => {
    if (!subject.trim()) { setError('科目名を入力してください'); return }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        semester,
        day_of_week:  cellDayOfWeek,
        period:       cellPeriod,
        subject:      subject.trim(),
        classroom:    classroom.trim() || null,
        teacher:      teacher.trim()   || null,
        note:         note.trim()      || null,
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
    /* オーバーレイ */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* ヘッダー */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {entry ? '科目を編集' : '科目を追加'}
            <span className="ml-2 text-xs font-normal text-slate-400">
              {DAYS[cellDayOfWeek]}曜 {cellPeriod}限
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
            aria-label="閉じる"
          >×</button>
        </div>

        {/* フォーム */}
        <div className="px-5 pb-5 space-y-3">
          {/* 科目名 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">科目名 *</label>
            <input
              ref={inputRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 線形代数"
            />
          </div>

          {/* 教室 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">教室</label>
            <input
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 101教室"
            />
          </div>

          {/* 担当教員 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">担当教員</label>
            <input
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 山田 太郎"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">メモ</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="自由記入"
            />
          </div>

          {/* カラー */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">色</label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: color === c.value ? '#1e293b' : 'transparent',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* エラー */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* ボタン */}
          <div className="flex gap-2 pt-1">
            {entry && onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? '削除中…' : '削除'}
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

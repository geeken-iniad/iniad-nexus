export type SemesterType = 'spring' | 'fall'

export interface TimetableEntry {
  id: string
  user_id: string
  semester: SemesterType
  day_of_week: number   // 0=月 〜 4=金
  period: number        // 1〜6
  subject: string
  classroom: string | null
  teacher: string | null
  color: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type TimetableInsert = Omit<TimetableEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TimetableUpdate = Partial<TimetableInsert>

export interface CellKey {
  day_of_week: number
  period: number
}

export const DAYS = ['月', '火', '水', '木', '金'] as const
export const PERIODS = [1, 2, 3, 4, 5, 6] as const

/** デフォルトカラーパレット（Tailwind クラスで管理） */
export const SUBJECT_COLORS = [
  { label: 'スカイ',    value: '#38bdf8' },
  { label: 'エメラルド', value: '#34d399' },
  { label: 'バイオレット', value: '#a78bfa' },
  { label: 'アンバー',  value: '#fbbf24' },
  { label: 'ローズ',   value: '#fb7185' },
  { label: 'オレンジ', value: '#fb923c' },
  { label: 'ライム',   value: '#a3e635' },
  { label: 'シアン',   value: '#22d3ee' },
] as const

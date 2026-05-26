import { createClient } from '@/utils/supabase/client'
import type { SemesterType, TimetableEntry, TimetableInsert, TimetableUpdate } from '@/types/timetable'

// -------------------------------------------------------
// 取得
// -------------------------------------------------------
export async function fetchTimetable(semester: SemesterType): Promise<TimetableEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('timetable')
    .select('*')
    .eq('semester', semester)
    .order('day_of_week')
    .order('period')

  if (error) throw error
  return data ?? []
}

// -------------------------------------------------------
// 追加
// -------------------------------------------------------
export async function addTimetableEntry(entry: TimetableInsert): Promise<TimetableEntry> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  const { data, error } = await supabase
    .from('timetable')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

// -------------------------------------------------------
// 更新
// -------------------------------------------------------
export async function updateTimetableEntry(id: string, updates: TimetableUpdate): Promise<TimetableEntry> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('timetable')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// -------------------------------------------------------
// 削除
// -------------------------------------------------------
export async function deleteTimetableEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('timetable')
    .delete()
    .eq('id', id)

  if (error) throw error
}

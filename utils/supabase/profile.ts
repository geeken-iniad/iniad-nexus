import { createClient } from '@/utils/supabase/client'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  university: string | null
  enrollment_year: number | null
  created_at: string
}

export interface ProfileUpdate {
  display_name?: string
  avatar_url?: string | null
  enrollment_year?: number | null
}

export async function fetchMyProfile(): Promise<Profile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function fetchFriendCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('friends')
    .select('*', { count: 'exact', head: true })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted')

  if (error) return 0
  return count ?? 0
}

export async function updateMyProfile(updates: ProfileUpdate): Promise<Profile> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Supabase Update Errorの詳細:', error)
    throw error
  }
  return data
}

export async function uploadAvatar(file: File): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  const ext = file.name.split('.').pop()
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { 
      upsert: true,
      contentType: file.type 
    })

  if (uploadError) {
    console.error('🔥 Storage Upload Errorの詳細:', uploadError)
    throw uploadError
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  
  return `${data.publicUrl}?t=${Date.now()}`
}

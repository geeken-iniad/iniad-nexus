import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { Profile, ProfileUpdate } from '@/types/profile'

const PROFILE_COLUMNS =
  'id, updated_at, username, full_name, avatar_url, website, enrollment_year, bio'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const profile = await getOrCreateProfile(supabase, user)

    return NextResponse.json({
      profile,
      email: user.email ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'プロフィールの取得に失敗しました') },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const update = normalizeProfileUpdate(body)

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...update,
        updated_at: new Date().toISOString(),
      })
      .select(PROFILE_COLUMNS)
      .single()

    if (error) {
      return NextResponse.json({ error: getProfileSaveErrorMessage(error) }, { status: 400 })
    }

    return NextResponse.json({
      profile: data as Profile,
      email: user.email ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, 'プロフィールの保存に失敗しました') },
      { status: 500 },
    )
  }
}

async function getOrCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (data) {
    return data as Profile
  }

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: getStringMetadata(user.user_metadata, 'full_name') ?? getStringMetadata(user.user_metadata, 'name'),
      avatar_url: getStringMetadata(user.user_metadata, 'avatar_url'),
      updated_at: new Date().toISOString(),
    })
    .select(PROFILE_COLUMNS)
    .single()

  if (createError) {
    throw createError
  }

  return created as Profile
}

function normalizeProfileUpdate(body: unknown): ProfileUpdate {
  if (!body || typeof body !== 'object') {
    throw new Error('プロフィール情報が不正です')
  }

  const value = body as Record<string, unknown>

  return {
    username: normalizeNullableString(value.username),
    avatar_url: normalizeNullableString(value.avatar_url),
    enrollment_year: normalizeEnrollmentYear(value.enrollment_year),
    bio: normalizeNullableString(value.bio),
  }
}

function normalizeEnrollmentYear(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const year = Number(value)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('入学年度は2000年から2100年の範囲で入力してください')
  }

  return year
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getStringMetadata(metadata: Record<string, unknown> | undefined, key: string): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function getProfileSaveErrorMessage(error: { code?: string; message?: string; details?: string | null }): string {
  const text = `${error.message ?? ''} ${error.details ?? ''}`

  if (error.code === '23505' && text.includes('profiles_username_key')) {
    return 'このユーザー名はすでに使われています'
  }

  return error.message ?? 'プロフィールの保存に失敗しました'
}

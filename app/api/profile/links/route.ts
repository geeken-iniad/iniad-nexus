import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { ProfileLink, ProfileLinkInput } from '@/types/profile'

const MAX_PROFILE_LINKS = 8
const PROFILE_LINK_COLUMNS = 'id, label, url, sort_order'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profile_links')
      .select(PROFILE_LINK_COLUMNS)
      .eq('user_id', user.id)
      .order('sort_order')

    if (error) {
      return NextResponse.json({ error: getProfileLinksErrorMessage(error) }, { status: 400 })
    }

    return NextResponse.json({ links: (data ?? []) as ProfileLink[] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'リンクの取得に失敗しました' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const body = await request.json()
    const links = normalizeProfileLinks(body)

    const { error: deleteError } = await supabase
      .from('profile_links')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: getProfileLinksErrorMessage(deleteError) }, { status: 400 })
    }

    if (links.length === 0) {
      return NextResponse.json({ links: [] })
    }

    const rows = links.map((link, index) => ({
      user_id: user.id,
      label: link.label,
      url: link.url,
      sort_order: index,
    }))

    const { data, error } = await supabase
      .from('profile_links')
      .insert(rows)
      .select(PROFILE_LINK_COLUMNS)
      .order('sort_order')

    if (error) {
      return NextResponse.json({ error: getProfileLinksErrorMessage(error) }, { status: 400 })
    }

    return NextResponse.json({ links: (data ?? []) as ProfileLink[] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'リンクの保存に失敗しました' },
      { status: 500 },
    )
  }
}

function normalizeProfileLinks(body: unknown): ProfileLinkInput[] {
  if (!body || typeof body !== 'object') {
    throw new Error('リンク情報が不正です')
  }

  const links = (body as { links?: unknown }).links
  if (!Array.isArray(links)) {
    throw new Error('リンク情報が不正です')
  }

  return links
    .map((item) => normalizeProfileLink(item))
    .filter((link): link is ProfileLinkInput => link !== null)
    .slice(0, MAX_PROFILE_LINKS)
}

function normalizeProfileLink(item: unknown): ProfileLinkInput | null {
  if (!item || typeof item !== 'object') return null

  const value = item as Record<string, unknown>
  const label = normalizeText(value.label)
  const url = normalizeUrl(value.url)

  if (!label && !url) return null
  if (!label || !url) {
    throw new Error('リンク名とURLを両方入力してください')
  }

  return { label, url }
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 40) : ''
}

function normalizeUrl(value: unknown): string {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    throw new Error('URLの形式を確認してください')
  }
}

function getProfileLinksErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code === '42P01' || error.message?.includes('profile_links')) {
    return 'profile_links テーブルを作成してください'
  }

  return error.message ?? 'リンクの保存に失敗しました'
}

import { createClient } from '@/utils/supabase/client'

export const AVATAR_BUCKET = 'avatars'

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

export function getAvatarDisplayUrl(src: string | null | undefined): string | null {
  const trimmed = src?.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/')) return trimmed

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
    if (!projectUrl) return null

    const encodedPath = trimmed
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/')

    return `${projectUrl}/storage/v1/object/public/${AVATAR_BUCKET}/${encodedPath}`
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  validateAvatarFile(file)

  const supabase = createClient()
  const filePath = buildAvatarPath(userId, file)
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return filePath
}

function validateAvatarFile(file: File) {
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選んでください')
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('画像サイズは2MB以下にしてください')
  }
}

function buildAvatarPath(userId: string, file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  return `${userId}/${crypto.randomUUID()}.${extension}`
}

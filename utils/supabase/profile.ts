import type { ProfileResponse, ProfileUpdate } from '@/types/profile'

export async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/profile', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'プロフィールの取得に失敗しました'))
  }

  return response.json()
}

export async function updateProfile(profile: ProfileUpdate): Promise<ProfileResponse> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'プロフィールの保存に失敗しました'))
  }

  return response.json()
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    return typeof data.error === 'string' ? data.error : fallback
  } catch {
    return fallback
  }
}

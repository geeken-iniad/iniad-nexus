import type { ProfileLink, ProfileLinkInput, ProfileLinksResponse } from '@/types/profile'

export async function fetchProfileLinks(): Promise<ProfileLink[]> {
  const response = await fetch('/api/profile/links', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'リンクの取得に失敗しました'))
  }

  const data = (await response.json()) as ProfileLinksResponse
  return data.links
}

export async function saveProfileLinks(links: ProfileLinkInput[]): Promise<ProfileLink[]> {
  const response = await fetch('/api/profile/links', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ links }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'リンクの保存に失敗しました'))
  }

  const data = (await response.json()) as ProfileLinksResponse
  return data.links
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json()
    return typeof data.error === 'string' ? data.error : fallback
  } catch {
    return fallback
  }
}

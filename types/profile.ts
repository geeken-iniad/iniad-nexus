export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  enrollment_year: number | null
  bio: string | null
  updated_at: string | null
}

export interface ProfileResponse {
  profile: Profile
  email: string | null
}

export type ProfileUpdate = Pick<
  Profile,
  'username' | 'avatar_url' | 'enrollment_year' | 'bio'
>

export interface ProfileLink {
  id: string
  label: string
  url: string
  sort_order: number
}

export type ProfileLinkInput = Pick<ProfileLink, 'label' | 'url'>

export interface ProfileLinksResponse {
  links: ProfileLink[]
}

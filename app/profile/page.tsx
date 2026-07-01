'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileLinkInput, ProfileResponse } from '@/types/profile'
import { getAvatarDisplayUrl, uploadAvatar } from '@/utils/supabase/avatar'
import { fetchProfile, updateProfile } from '@/utils/supabase/profile'
import { fetchProfileLinks, saveProfileLinks } from '@/utils/supabase/profile-links'

const currentYear = new Date().getFullYear()
const enrollmentYears = Array.from({ length: 8 }, (_, index) => currentYear - index)
const maxProfileLinks = 8

function cohortLabel(enrollmentYear: number): string {
  return `${enrollmentYear - 2016}期生`
}

export default function ProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<ProfileResponse | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [links, setLinks] = useState<ProfileLinkInput[]>([{ label: '', url: '' }])
  const [bio, setBio] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null)
  const localAvatarPreviewRef = useRef<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const profileData = await fetchProfile()
        const profileLinks = await fetchProfileLinks().catch((linkError) => {
          if (linkError instanceof Error && linkError.message.includes('profile_links')) {
            setError(linkError.message)
            return []
          }
          throw linkError
        })

        if (!mounted) return
        setData(profileData)
        setUsername(profileData.profile.username ?? '')
        setAvatarUrl(profileData.profile.avatar_url ?? '')
        setLinks(profileLinks.length > 0 ? profileLinks.map(({ label, url }) => ({ label, url })) : [{ label: '', url: '' }])
        setBio(profileData.profile.bio ?? '')
        setEnrollmentYear(profileData.profile.enrollment_year?.toString() ?? '')
      } catch (profileError) {
        if (!mounted) return
        if (profileError instanceof Error && profileError.message === 'ログインが必要です') {
          router.push('/login')
          return
        }
        setError(profileError instanceof Error ? profileError.message : 'プロフィールの取得に失敗しました')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [router])

  const previewName = useMemo(() => {
    return username || data?.profile.full_name || data?.email || 'User'
  }, [data?.email, data?.profile.full_name, username])

  useEffect(() => {
    return () => {
      if (localAvatarPreviewRef.current) URL.revokeObjectURL(localAvatarPreviewRef.current)
    }
  }, [])

  const avatarPreviewSrc = useMemo(() => {
    return localAvatarPreview ?? getAvatarDisplayUrl(avatarUrl)
  }, [avatarUrl, localAvatarPreview])

  const previewLinks = useMemo(() => {
    return links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      }))
      .filter((link) => link.label && link.url)
      .slice(0, maxProfileLinks)
  }, [links])

  const handleLinkChange = (index: number, field: keyof ProfileLinkInput, value: string) => {
    setLinks((currentLinks) => currentLinks.map((link, linkIndex) => (
      linkIndex === index ? { ...link, [field]: value } : link
    )))
  }

  const handleAddLink = () => {
    setLinks((currentLinks) => (
      currentLinks.length >= maxProfileLinks ? currentLinks : [...currentLinks, { label: '', url: '' }]
    ))
  }

  const handleRemoveLink = (index: number) => {
    setLinks((currentLinks) => currentLinks.filter((_, linkIndex) => linkIndex !== index))
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !data?.profile.id) return

    if (file.type && !file.type.startsWith('image/')) {
      setError('画像ファイルを選んでください')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    if (localAvatarPreviewRef.current) URL.revokeObjectURL(localAvatarPreviewRef.current)
    localAvatarPreviewRef.current = objectUrl
    setLocalAvatarPreview(objectUrl)
    setUploadingAvatar(true)
    setMessage(null)
    setError(null)

    try {
      const uploadedPath = await uploadAvatar(data.profile.id, file)
      setAvatarUrl(uploadedPath)
      setMessage('画像をアップロードしました。保存するとプロフィールに反映されます')
    } catch (avatarError) {
      setError(avatarError instanceof Error ? avatarError.message : '画像のアップロードに失敗しました')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    try {
      const linksToSave = links
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.label || link.url)

      const [updated, savedLinks] = await Promise.all([
        updateProfile({
        username,
        avatar_url: avatarUrl,
        bio,
        enrollment_year: enrollmentYear ? Number(enrollmentYear) : null,
        }),
        saveProfileLinks(linksToSave),
      ])
      setData(updated)
      setUsername(updated.profile.username ?? '')
      setAvatarUrl(updated.profile.avatar_url ?? '')
      if (localAvatarPreviewRef.current) URL.revokeObjectURL(localAvatarPreviewRef.current)
      localAvatarPreviewRef.current = null
      setLocalAvatarPreview(null)
      setLinks(savedLinks.length > 0 ? savedLinks.map(({ label, url }) => ({ label, url })) : [{ label: '', url: '' }])
      setBio(updated.profile.bio ?? '')
      setEnrollmentYear(updated.profile.enrollment_year?.toString() ?? '')
      setMessage('プロフィールを保存しました')
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'プロフィールの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6fbff] px-5 py-6 text-[#273242] md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-[#b9ddeb] bg-white px-4 py-2 text-sm font-bold text-[#247fc1] shadow-sm transition-colors hover:bg-[#edf8fc]"
          >
            Home
          </Link>
          <p className="text-sm font-semibold text-[#628095]">Profile</p>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(240px,320px)_1fr] lg:items-start">
          <aside className="rounded-[28px] border border-white bg-white p-6 shadow-[0_20px_60px_-32px_rgba(37,88,124,0.42)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-[#dceff7] ring-4 ring-[#e8f8fd]">
                {avatarPreviewSrc ? (
                  <div
                    aria-label={previewName}
                    role="img"
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${avatarPreviewSrc}")` }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#247fc1]">
                    {previewName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <h1 className="mt-5 max-w-full truncate text-2xl font-extrabold">{previewName}</h1>
              <p className="mt-1 max-w-full truncate text-sm text-[#6e8191]">{data?.email ?? ''}</p>
              <div className="mt-5 rounded-2xl bg-[#eef8fb] px-4 py-3 text-sm font-bold text-[#247fc1]">
                {enrollmentYear ? cohortLabel(Number(enrollmentYear)) : '期生未設定'}
              </div>
              {bio ? (
                <p className="mt-5 line-clamp-4 text-sm leading-6 text-[#6e8191]">{bio}</p>
              ) : null}
              {previewLinks.length > 0 ? (
                <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
                  {previewLinks.slice(0, 4).map((link, index) => (
                    <a
                      key={`${link.label}-${index}`}
                      href={toLinkHref(link.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-full truncate rounded-full bg-[#eef8fb] px-3 py-2 text-xs font-bold text-[#247fc1] transition-colors hover:bg-[#dff1f8]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white bg-white p-5 shadow-[0_20px_60px_-32px_rgba(37,88,124,0.42)] md:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-[#26384c]">プロフィール設定</h2>
              <p className="mt-2 text-sm leading-6 text-[#6e8191]">
                表示名、ユーザー名、自己紹介などをプロフィールテーブルに保存します。
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-[#f2f8fb] px-4 py-8 text-center text-sm font-bold text-[#628095]">
                読み込み中...
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">メールアドレス</span>
                  <input
                    value={data?.email ?? ''}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-[#d8e7ee] bg-[#f6f9fb] px-4 py-3 text-sm text-[#6e8191]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">Google 表示名</span>
                  <input
                    value={data?.profile.full_name ?? ''}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-[#d8e7ee] bg-[#f6f9fb] px-4 py-3 text-sm text-[#6e8191]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">ユーザー名</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">期生</span>
                  <select
                    value={enrollmentYear}
                    onChange={(event) => setEnrollmentYear(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                  >
                    <option value="">未設定</option>
                    {enrollmentYears.map((year) => (
                      <option key={year} value={year}>
                        {cohortLabel(year)}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#42576b]">リンク / SNS</span>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      disabled={links.length >= maxProfileLinks}
                      className="rounded-full border border-[#b9ddeb] bg-white px-4 py-2 text-xs font-bold text-[#247fc1] transition-colors hover:bg-[#edf8fc] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      追加
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {links.map((link, index) => (
                      <div
                        key={index}
                        className="grid gap-3 rounded-2xl border border-[#d8e7ee] bg-[#f8fbfd] p-3 md:grid-cols-[minmax(120px,180px)_1fr_auto] md:items-end"
                      >
                        <label className="block">
                          <span className="text-xs font-bold text-[#6e8191]">名前</span>
                          <input
                            value={link.label}
                            onChange={(event) => handleLinkChange(index, 'label', event.target.value)}
                            maxLength={40}
                            className="mt-1 w-full rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                          />
                        </label>

                        <label className="block">
                          <span className="text-xs font-bold text-[#6e8191]">URL</span>
                          <input
                            value={link.url}
                            onChange={(event) => handleLinkChange(index, 'url', event.target.value)}
                            inputMode="url"
                            className="mt-1 w-full rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="rounded-full border border-[#f0c7cf] bg-white px-4 py-3 text-xs font-bold text-[#c94250] transition-colors hover:bg-[#fff0f1]"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">プロフィール画像</span>
                  <input
                    type="file"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="mt-2 w-full rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#eef8fb] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#247fc1] focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="mt-2 block text-xs leading-5 text-[#6e8191]">
                    {uploadingAvatar ? 'アップロード中...' : '2MBまで'}
                  </span>
                  {localAvatarPreview ? (
                    <div className="mt-3 flex items-center gap-4 rounded-2xl bg-[#eef8fb] p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs from file inputs cannot be handled by next/image. */}
                      <img
                        src={localAvatarPreview}
                        alt="選択したプロフィール画像のプレビュー"
                        className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-white"
                      />
                      <p className="text-xs font-bold leading-5 text-[#247fc1]">
                        選択した画像をプレビュー中です。保存するとプロフィールに反映されます
                      </p>
                    </div>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#42576b]">自己紹介</span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="興味のある分野やひとこと"
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-[#cfe2ea] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#247fc1] focus:ring-4 focus:ring-[#247fc1]/10"
                  />
                </label>

                {message ? (
                  <p className="rounded-2xl bg-[#e9f8ef] px-4 py-3 text-sm font-bold text-[#207545]">{message}</p>
                ) : null}

                {error ? (
                  <p className="rounded-2xl bg-[#fff0f1] px-4 py-3 text-sm font-bold text-[#c94250]">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-[#247fc1] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#247fc1]/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? '保存中...' : '保存する'}
                </button>
              </form>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

function toLinkHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

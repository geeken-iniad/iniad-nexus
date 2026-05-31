'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { Profile, ProfileUpdate } from '@/utils//supabase/profile'
import { updateMyProfile, uploadAvatar } from '@/utils//supabase/profile'

interface Props {
  profile: Profile
  onSave: (updated: Profile) => void
  onClose: () => void
}

export default function ProfileEditModal({ profile, onSave, onClose }: Props) {
  const [displayName,   setDisplayName]   = useState(profile.display_name ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const updates: ProfileUpdate = {
        display_name: displayName.trim() || undefined,
      }
      if (avatarFile) {
        updates.avatar_url = await uploadAvatar(avatarFile)
      }
      const updated = await updateMyProfile(updates)
      onSave(updated)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const initials = (displayName || profile.username).charAt(0).toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* ハンドル */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button onClick={onClose} className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
            キャンセル
          </button>
          <h2 className="text-sm font-bold text-slate-800">プロフィールを編集</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-bold text-[#2EC4B6] hover:text-[#1aab9f] disabled:opacity-40 transition-colors"
          >
            {saving ? '保存中…' : '完了'}
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* アバター */}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#2EC4B6]/20">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="avatar" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2EC4B6] to-[#1a8f87] flex items-center justify-center text-3xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
              {/* ホバー時オーバーレイ */}
              <div className="absolute inset-0 rounded-full bg-[#2EC4B6]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" />
                  <path d="M10 14a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
            </button>
            <span className="text-xs font-semibold text-[#2EC4B6]">プロフィール写真を変更</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* 表示名 */}
          <div className="bg-slate-50 rounded-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3.5 gap-3">
              <span className="text-xs font-semibold text-slate-400 w-16 shrink-0">表示名</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile.username}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}

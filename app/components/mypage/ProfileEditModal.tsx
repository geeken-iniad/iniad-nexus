'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { Profile, ProfileUpdate } from '@/utils/supabase/profile'
import { updateMyProfile, uploadAvatar } from '@/utils/supabase/profile'

interface Props {
  profile: Profile
  onSave: (updated: Profile) => void
  onClose: () => void
}

export default function ProfileEditModal({ profile, onSave, onClose }: Props) {
  // 各項目のState
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [enrollmentYear, setEnrollmentYear] = useState<string>(
    profile.enrollment_year ? profile.enrollment_year.toString() : ''
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Escキーで閉じる
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // メモリリーク防止
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview !== profile.avatar_url) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview, profile.avatar_url])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarPreview && avatarPreview !== profile.avatar_url) {
      URL.revokeObjectURL(avatarPreview)
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const updates: ProfileUpdate = {
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        enrollment_year: enrollmentYear ? parseInt(enrollmentYear, 10) : null,
      }
      
      if (avatarFile) {
        updates.avatar_url = await uploadAvatar(avatarFile)
      }
      
      const updated = await updateMyProfile(updates)
      onSave(updated)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
      setSaving(false)
    }
  }

  const initials = (displayName || profile.username).charAt(0).toUpperCase()

  // 入学年度の選択肢（今年から過去8年分）
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 8 }).map((_, i) => currentYear - i)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

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

        <div className="px-5 py-5 space-y-4">
          
          {/* アバター */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="relative group" aria-label="アバター画像を変更">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#2EC4B6]/20">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2EC4B6] to-[#1a8f87] flex items-center justify-center text-3xl font-bold text-white">
                    {initials}
                  </div>
                )}
              </div>
            </button>
            <span className="text-xs font-semibold text-[#2EC4B6]">写真を変更</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
            
            {/* 表示名 */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 w-14 shrink-0">表示名</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile.username}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none"
              />
            </div>

            {/* 入学年度 */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 w-14 shrink-0">入学年度</span>
              <select
                value={enrollmentYear}
                onChange={(e) => setEnrollmentYear(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">未設定</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}年度 入学</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* 自己紹介 */}
            <div className="flex gap-3 pt-1">
              <span className="text-xs font-semibold text-slate-400 w-14 shrink-0 mt-1">自己紹介</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="趣味やひとこと..."
                rows={3}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none"
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
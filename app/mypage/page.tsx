'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Profile } from '@/utils/supabase/profile'
import { fetchFriendCount, fetchMyProfile } from '@/utils/supabase/profile'
import ProfileEditModal from '../components/mypage/ProfileEditModal'
import BottomNav from '@/app/components/BottomNav'

export default function MyPage() {
  const [profile,     setProfile]     = useState<Profile | null>(null)
  const [friendCount, setFriendCount] = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [editOpen,    setEditOpen]    = useState(false)

  useEffect(() => {
    Promise.all([fetchMyProfile(), fetchFriendCount()])
      .then(([p, fc]) => { setProfile(p); setFriendCount(fc) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2EC4B6]/30 border-t-[#2EC4B6] animate-spin" />
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center text-slate-600">
        <p>プロフィールが見つかりません</p>
      </main>
    )
  }

  const displayName = profile.display_name || profile.username

  return (
    <main className="min-h-screen bg-white text-slate-800 pb-24">

      {/* ── ナビゲーションバー ── */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
        <span className="text-sm font-bold tracking-wide text-slate-800">@{profile.username}</span>
        <button
          onClick={() => setEditOpen(true)}
          className="text-slate-400 hover:text-[#2EC4B6] transition-colors"
          aria-label="編集"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-4">

        {/* ── プロフィールヘッダー ── */}
        <div className="pt-8 pb-6 flex flex-col items-center gap-4">

          {/* アバター（タップで編集） */}
          <button onClick={() => setEditOpen(true)} className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#2EC4B6]/25 shadow-lg shadow-[#2EC4B6]/10">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2EC4B6] to-[#1a8f87] flex items-center justify-center text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* カメラアイコン */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#2EC4B6] rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" />
                <path d="M10 14a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
          </button>

          {/* 名前 */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">{displayName}</h1>
            <p className="text-sm text-slate-400 mt-0.5">@{profile.username}</p>
          </div>

          {/* スタッツ */}
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-800">{friendCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">フレンド</p>
            </div>
          </div>

          {/* 編集ボタン */}
          <button
            onClick={() => setEditOpen(true)}
            className="px-8 py-2 rounded-full border-2 border-[#2EC4B6] text-sm font-bold text-[#2EC4B6] hover:bg-[#2EC4B6]/5 active:scale-[0.98] transition-all"
          >
            プロフィールを編集
          </button>
        </div>

        {/* ── セパレーター ── */}
        <div className="border-t border-slate-100 mx-2" />

        {/* ── フレンドリスト（横並び） ── */}
        <div className="py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700">フレンド</h2>
            {/* フレンド機能実装後にリンクを有効化 */}
            <span className="text-xs text-slate-300">近日公開</span>
          </div>

          {/* 横スクロールのアイコン列（プレースホルダー） */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {friendCount === 0 ? (
              /* 空状態 */
              <div className="flex flex-col items-center justify-center w-full py-6 gap-2">
                <div className="w-14 h-14 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400">フレンドを追加しよう</p>
              </div>
            ) : (
              /* フレンドがいる場合のプレースホルダー（実装後に差し替え） */
              Array.from({ length: Math.min(friendCount, 8) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
                  <div className="w-10 h-2 rounded bg-slate-100 animate-pulse" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 mx-2" />

        {/* ── QRコード（フレンド機能実装後） ── */}
        <div className="py-5">
          <h2 className="text-sm font-bold text-slate-700 mb-3">フレンド追加QRコード</h2>
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-8 gap-3">
            {/* QRのプレースホルダーグリッド */}
            <div className="w-28 h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-5 gap-[3px] opacity-20">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[2px] ${Math.random() > 0.4 ? 'bg-slate-800' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center px-6">
              フレンド機能が実装されると<br />QRコードが表示されます
            </p>
            <span className="px-3 py-1 rounded-full bg-[#2EC4B6]/10 text-[#2EC4B6] text-xs font-semibold">
              近日公開
            </span>
          </div>
        </div>

      </div>

      {/* 編集モーダル */}
      {editOpen && (
        <ProfileEditModal
          profile={profile}
          onSave={setProfile}
          onClose={() => setEditOpen(false)}
        />
      )}

      <BottomNav />
    </main>
  )
}

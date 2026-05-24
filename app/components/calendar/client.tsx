"use client";

import LoginPage from "../../login/page"; // 既存のログインコンポーネント

export default function Calender({ user }: { user: any }) {
  // 1. 未ログインならログイン画面を出す
  if (!user) {
    return <LoginPage />;
  }

  // 2. ログイン済みならカレンダーを表示する
  return (
    <div className="p-2">
        {/* Googleカレンダーの埋め込み */}
        <a href="https://calendar.google.com/calendar/render?action=TEMPLATE">予定を追加</a>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <iframe
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(user.email)}&ctz=Asia/Tokyo`}
          style={{ border: 0 }}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="no"
          ></iframe>
          </div>
    </div>
  );
}

'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { saveScheduleToStorage } from '@/app/lib/schedule';

export default function TimetableUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // 簡易的なバリデーション（キー "1" があるか確認）
        if (!json["1"] || !Array.isArray(json["1"])) {
          alert("INIAD形式のJSONファイルではないようです。");
          return;
        }

        saveScheduleToStorage(json);
        alert("時間割を更新しました！");
        window.location.reload(); // 画面を更新してデータを反映
      } catch (error) {
        alert("ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".json"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isUploading ? '読み込み中...' : 'JSONをインポート'}
      </button>
    </div>
  );
}
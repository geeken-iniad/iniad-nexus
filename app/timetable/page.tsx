// app/timetable/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getScheduleData, PERIODS, Course } from '@/app/lib/schedule';
import TimetableUploader from '@/app/components/TimetableUploader';
import Link from 'next/link';

const WEEKDAYS = ['月', '火', '水', '木', '金', '土'];

export default function TimetablePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(1); // デフォルト月曜

  useEffect(() => {
    // クライアントサイドで現在の曜日を取得してセット
    const today = new Date().getDay();
    if (today >= 1 && today <= 6) {
      setSelectedDay(today);
    }
    setCourses(getScheduleData());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ナビゲーションヘッダー */}
      <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
                ← Home
            </Link>
            <h1 className="font-bold text-lg text-gray-800">時間割</h1>
            <TimetableUploader />
        </div>
        
        {/* 表示切り替えトグル */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition ${
              viewMode === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            週間
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition ${
              viewMode === 'day' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
            }`}
          >
            一日
          </button>
        </div>
      </nav>

      <main className="p-4">
        {/* 週間ビュー */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                <div className="p-2 text-center text-xs text-gray-400 font-bold">限</div>
                {WEEKDAYS.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-bold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 各時限の行 */}
              {PERIODS.map((period) => (
                <div key={period.id} className="grid grid-cols-7 border-b border-gray-100 last:border-0 h-28">
                  {/* 時限セル */}
                  <div className="p-1 flex flex-col justify-center items-center bg-gray-50 border-r border-gray-100">
                      <span className="font-bold text-gray-700 text-lg">{period.id}</span>
                      <span className="text-[10px] text-gray-400">{period.start}</span>
                  </div>
                  
                  {/* 授業セル */}
                  {WEEKDAYS.map((_, index) => {
                    const dayNum = index + 1; // 月=1 ...
                    const course = courses.find(c => c.day === dayNum && c.period === period.id);
                    
                    return (
                      <div key={`${dayNum}-${period.id}`} className="p-1 border-r border-gray-100 last:border-0 relative">
                        {course ? (
                          <div className="w-full h-full rounded p-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition cursor-pointer flex flex-col">
                            <span className="text-xs font-bold text-blue-900 line-clamp-3 leading-tight">
                                {course.title}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full" /> 
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 一日ビュー */}
        {viewMode === 'day' && (
          <div className="max-w-md mx-auto">
            {/* 曜日選択ボタン */}
            <div className="flex gap-2 mb-6 overflow-x-auto py-1 px-1 no-scrollbar">
              {WEEKDAYS.map((day, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = selectedDay === dayNum;
                  return (
                      <button 
                          key={day}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold transition shadow-sm
                              ${isSelected ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-white text-gray-500 border border-gray-200'}`}
                      >
                          {day}
                      </button>
                  )
              })}
            </div>

            {/* タイムライン */}
            <div className="space-y-4">
               {PERIODS.map((period) => {
                   const course = courses.find(c => c.day === selectedDay && c.period === period.id);
                   // 授業がないコマは薄く表示するか、非表示にするか選べますが、ここでは薄く表示します
                   return (
                       <div key={period.id} className="flex gap-4 group">
                           {/* 左側の時間表示 */}
                           <div className="w-12 flex-shrink-0 flex flex-col items-center pt-2">
                               <span className="text-lg font-bold text-gray-400 group-hover:text-blue-500 transition">{period.id}</span>
                               <span className="text-[10px] text-gray-400">{period.start}</span>
                               <div className="h-full w-0.5 bg-gray-200 mt-2 mb-[-8px]"></div>
                           </div>

                           {/* 授業カード */}
                           <div className={`flex-grow rounded-xl p-4 border transition-all ${
                               course 
                               ? 'bg-white border-blue-200 shadow-sm border-l-4 border-l-blue-500 translate-x-1' 
                               : 'bg-transparent border-dashed border-gray-300 opacity-50'
                           }`}>
                               {course ? (
                                   <div>
                                       <h3 className="font-bold text-gray-800">{course.title}</h3>
                                       <div className="flex gap-2 text-xs text-gray-500 mt-2">
                                           <span className="bg-gray-100 px-2 py-1 rounded">教室未定</span>
                                       </div>
                                   </div>
                               ) : (
                                   <div className="h-full flex items-center text-gray-400 text-sm">
                                       授業なし
                                   </div>
                               )}
                           </div>
                       </div>
                   )
               })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
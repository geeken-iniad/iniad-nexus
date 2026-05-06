'use client';

import { useEffect, useState } from 'react';
import { Course, getNextClass, PERIODS } from '@/app/lib/schedule'; 

export default function NextClassCard() {
  const [nextClass, setNextClass] = useState<Course | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNextClass(getNextClass());
  }, []);

  if (!mounted) return null;

  if (!nextClass) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-400">
        本日の授業は終了しました
      </div>
    );
  }

  const periodTime = PERIODS.find(p => p.id === nextClass.period);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-gray-900 border-l-4 border-blue-500 rounded-r-lg p-3 shadow-md">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">NEXT CLASS</span>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
            {nextClass.period}限 {periodTime?.start}~
        </span>
      </div>
      <h3 className="text-sm font-bold text-white truncate">{nextClass.title}</h3>
    </div>
  );
}
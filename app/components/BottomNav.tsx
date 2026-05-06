'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/timetable', label: '時間割', icon: '📅' },
    { href: '/schedule', label: 'スケジュール', icon: '📝' },
    { href: '/others', label: 'その他', icon: '⚙️' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-2 shadow-lg z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center w-full"
          >
            {/* ナビゲーションアイテムのボックス */}
            <div
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${
                isActive ? 'bg-gray-200' : 'bg-transparent'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={`text-[10px] leading-tight ${
                  isActive ? 'text-black font-bold' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
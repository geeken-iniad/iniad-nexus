'use client';

import { type ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type LogoutButtonProps = {
  children: ReactNode;
  className?: string;
  redirectTo?: string;
  onSuccess?: () => void | Promise<void>;
};

export default function LogoutButton({
  children,
  className = '',
  redirectTo = '/login',
  onSuccess,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      console.error('ログアウトに失敗しました:', error.message);
      return;
    }

    await onSuccess?.();
    router.push(redirectTo);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className}
      aria-label="ログアウト"
    >
      {children}
    </button>
  );
}
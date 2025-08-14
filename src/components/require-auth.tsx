'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { auth } from '@/lib/auth';

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function verify() {
      try {
        // Jika tidak ada token sama sekali, langsung ke login
        if (!auth.token) {
          router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
          return;
        }
        // Verifikasi token dengan /auth/me
        await authAPI.me();
      } catch {
        auth.logout();
        router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
        return;
      } finally {
        if (!ignore) setChecking(false);
      }
    }
    verify();
    return () => { ignore = true; };
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent" />
        <span className="sr-only">Memeriksa sesi...</span>
      </div>
    );
  }

  return <>{children}</>;
}




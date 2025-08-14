'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html>
      <body className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-3">Terjadi Kesalahan</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Kami mengalami kendala saat memuat halaman ini. Silakan coba lagi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90"
          >
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Dashboard
          </a>
        </div>
      </body>
    </html>
  );
}

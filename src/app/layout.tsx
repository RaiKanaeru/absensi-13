import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';

// Konfigurasi font Inter
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Sistem Absensi Kelas',
  description: 'Aplikasi Web Modern untuk Manajemen Absensi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
      </head>
      <body className={cn('min-h-screen bg-background font-inter antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

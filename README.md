# Absensi 13 — One-port Setup (Next.js + Express + MySQL)

## Prasyarat
- Node.js 18+
- XAMPP MySQL berjalan (port 3306/3307)

## Konfigurasi
1. Duplikasi `.env.example` menjadi `.env` di root, isi kredensial DB dan `PORT`.
2. Import skema dan seed sesuai `database.md` (wajib ada `school_years` aktif).

## Menjalankan
```bash
npm install
npm run dev
# buka http://localhost:3000
```

Produksi:
```bash
npm run build
npm run start
```

## Arsitektur
- `server/index.js`: Express menjalankan Next.js sebagai middleware dan memasang API `/api/*`.
- `backend/config/database.js`: koneksi mysql2/promise (dipakai oleh route API).
- `backend/routes/*`: endpoint API (auth, classes, attendance, reports, users).
- `src/*`: Next.js (App Router) — halaman, komponen, dan pemanggilan API same-origin `/api`.

## Catatan
- Jangan jalankan `backend/server.js`; file itu sudah deprecated.
- Tidak perlu CORS karena same-origin (satu port).

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

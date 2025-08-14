---
title: High-Level Architecture Decisions
status: accepted
date: 2025-08-14
---

## Context

Sistem absensi kelas membutuhkan aplikasi web terpadu (SPA + API) yang cepat di-deploy, mudah dipelihara, dan aman. Awalnya frontend & backend terpisah; kini disatukan one-port untuk kesederhanaan deploy.

## Decision

1. Monorepo Next.js (App Router) + Express one-port server (custom server) agar:
  * Menghindari konfigurasi CORS.
  * Memungkinkan sharing util / config.
2. MySQL dipilih karena kebutuhan relasional kuat & referential integrity (FK untuk siswa, kelas, jadwal, kehadiran).
3. Auth: JWT stateless (Authorization: Bearer) sementara; opsi refresh-token + HttpOnly cookie ditambahkan di future ADR.
4. RBAC sederhana berbasis kolom role pada tabel users (admin, guru, wali_kelas, siswa) + middleware requireRole.
5. Validasi: Zod untuk konsistensi tipe & pesan error.
6. Ekspor Laporan: ExcelJS (ketergantungan minimal, kontrol penuh sheet & styling).
7. Observability: request-id per permintaan, morgan logging ringkas + korelasi.
8. Keamanan: helmet, rate limiting 200/15m (configurable env), hashing bcrypt; fallback hash legacy sha256+salt untuk kompatibilitas.

## Alternatives Considered

* Separate FE (Next.js) & BE (pure API) via CORS: lebih fleksibel namun tambah latensi & kompleksitas deploy.
* ORMs (Prisma/TypeORM): menambah lapisan, saat ini query SQL langsung cukup dan transparan. (Catatan: bila kompleksitas bertambah, migrasi ke Prisma dipertimbangkan untuk schema drift detection.)

## Consequences

Positif: Deployment sederhana (satu proses), sharing environment, lebih sedikit overhead HTTP.
Negatif: Scaling FE/BE independen lebih sulit; perlu cluster mode / horizontal scaling untuk beban tinggi.

## Next Steps

* ADR terpisah untuk strategi token refresh & secure storage.
* Tambah metrics (Prometheus endpoint) & tracing distributed bila diperlukan.

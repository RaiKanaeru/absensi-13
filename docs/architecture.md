# Arsitektur Aplikasi Absensi

## Overview

Aplikasi absensi menggunakan arsitektur **one-port** yang menggabungkan Next.js (frontend) dan Express.js (backend) dalam satu server untuk menghindari masalah CORS dan menyederhanakan deployment.

## Diagram Arsitektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Next.js       │    │   Express.js    │
│   (Browser)     │◄──►│   (Frontend)    │◄──►│   (Backend)     │
│                 │    │                 │    │                 │
│ - React         │    │ - App Router    │    │ - API Routes    │
│ - TypeScript    │    │ - Components    │    │ - Middleware    │
│ - Tailwind CSS  │    │ - Pages         │    │ - Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Static Files  │    │   MySQL         │
                       │   (Icons, etc)  │    │   (XAMPP)       │
                       └─────────────────┘    └─────────────────┘
```

## Komponen Utama

### 1. Server Entry Point (`server/index.js`)
- **Fungsi**: Entry point utama yang menjalankan Express + Next.js
- **Port**: 3000 (configurable via `.env`)
- **Middleware**: Helmet, Morgan, Rate Limit, JSON parser
- **Routes**: `/api/*` untuk backend, `*` untuk frontend

### 2. Frontend (Next.js App Router)
- **Struktur**: `src/app/`
- **Pages**: Login, Dashboard, Classes, Users, Attendance, Reports
- **Components**: Reusable UI components dengan shadcn/ui
- **State Management**: React hooks + localStorage untuk auth
- **Styling**: Tailwind CSS + custom theme

### 3. Backend (Express.js)
- **Routes**: `backend/routes/`
  - `auth.js`: Login, token verification
  - `classes.js`: CRUD kelas
  - `users.js`: CRUD pengguna (admin only)
  - `attendance.js`: Absensi siswa
  - `reports.js`: Laporan + export Excel
- **Middleware**: `backend/middleware/auth.js`
  - JWT verification
  - Role-based access control
- **Database**: `backend/config/database.js`
  - MySQL connection pool
  - Connection testing

### 4. Database (MySQL via XAMPP)
- **Schema**: Lihat `database.md`
- **Tables**: users, teachers, classes, students, attendance_sessions, dll
- **Views**: Rekap absensi, jadwal hari ini
- **Stored Procedures**: Buat sesi absensi, finalisasi

## Alur Data

### 1. Authentication Flow
```
Login Form → POST /api/auth/login → JWT Token → localStorage → RequireAuth Guard
```

### 2. Attendance Flow
```
Dashboard → Select Class → GET /api/attendance/schedule/:id → Record Attendance → POST /api/attendance/record
```

### 3. Reports Flow
```
Reports Page → Filter Class/Month → GET /api/reports/class/:id → Export Excel → GET /api/reports/export
```

## Security

### 1. Authentication
- JWT tokens dengan expiration
- bcrypt password hashing
- Role-based access control

### 2. Authorization
- `requireRole(['admin', 'guru', 'wali_kelas'])` middleware
- Frontend role-aware UI (menu filtering)
- API endpoint protection

### 3. Security Headers
- Helmet.js untuk CSP, XSS protection
- Rate limiting (200 requests/15min)
- Input validation (basic)

## Development vs Production

### Development
- Hot Module Replacement (HMR)
- Detailed error messages
- CSP relaxed untuk HMR
- Morgan logging

### Production
- Static file serving
- Optimized builds
- Strict CSP
- Error handling

## File Structure

```
absensi-13/
├── server/
│   └── index.js              # Main server entry point
├── backend/
│   ├── config/
│   │   └── database.js       # MySQL connection
│   ├── middleware/
│   │   └── auth.js          # JWT + RBAC middleware
│   └── routes/
│       ├── auth.js          # Authentication
│       ├── classes.js       # Classes management
│       ├── users.js         # Users CRUD
│       ├── attendance.js    # Attendance recording
│       └── reports.js       # Reports + export
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities
│   └── hooks/               # Custom hooks
├── public/
│   └── icons/              # Custom SVG icons
├── docs/                   # Documentation
├── .env                    # Environment variables
└── package.json
```

## Deployment Considerations

### Single Port Architecture
- **Pros**: No CORS issues, simpler deployment
- **Cons**: Single point of failure, harder to scale

### Database
- MySQL via XAMPP (development)
- Consider cloud MySQL for production
- Backup strategy needed

### Environment Variables
- `.env` for local development
- Environment-specific configs for production
- Secure JWT secrets

## Performance

### Frontend
- Next.js App Router for better performance
- Static generation where possible
- Image optimization
- Bundle splitting

### Backend
- Connection pooling for database
- Rate limiting to prevent abuse
- Efficient queries with proper indexing
- Caching strategy (future enhancement)

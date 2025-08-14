## Sequence Diagrams

### 1. Login (username/password → JWT + profil)
```mermaid
sequenceDiagram
	participant U as User (Browser)
	participant FE as Next.js Frontend
	participant API as Express API
	participant DB as MySQL
	U->>FE: Submit form (username,password)
	FE->>API: POST /api/auth/login
	API->>DB: SELECT user by username
	DB-->>API: user row (hash, role)
	API->>API: Verify password (bcrypt or legacy sha256)
	API->>DB: (opt) SELECT teacher profile
	DB-->>API: teacher row
	API-->>FE: { success, data:{ token, user } }
	FE->>FE: Store token (localStorage)
	FE-->>U: Redirect /dashboard
```

### 2. Isi Absensi (teacher.today → attendance.save)
```mermaid
sequenceDiagram
	participant T as Teacher UI
	participant FE as Frontend
	participant API as Express
	participant DB as MySQL
	T->>FE: Open Dashboard (needs today sessions)
	FE->>API: GET /api/attendance/teacher/:id/today (Bearer token)
	API->>DB: SELECT schedules for teacher + active year
	DB-->>API: schedules[]
	API-->>FE: { success, data: schedules }
	T->>FE: Open one schedule (pick date)
	FE->>API: GET /api/attendance/schedule/:scheduleId?date=YYYY-MM-DD
	API->>DB: Ensure/create attendance_session + fetch students + statuses
	DB-->>API: session + students
	API-->>FE: { success, data:{ session_id, students[] } }
	T->>FE: Mark statuses & Save
	FE->>API: POST /api/attendance/record { schedule_id, attendance_date, records[] }
	API->>DB: BEGIN; DELETE old; INSERT new; COMMIT
	DB-->>API: ok
	API-->>FE: { success, message: 'Absensi disimpan' }
	FE-->>T: Toast success
```

### 3. Laporan (filter kelas/bulan → export Excel)
```mermaid
sequenceDiagram
	participant U as User (Teacher/Admin)
	participant FE as Frontend
	participant API as Express
	participant DB as MySQL
	U->>FE: Select class + month + year
	FE->>API: GET /api/reports/class/:classId?month=&year=
	API->>DB: SELECT students + attendance aggregates
	DB-->>API: rows
	API-->>FE: { success, data:{ students[] } }
	U->>FE: Click Export
	FE->>API: GET /api/reports/export?classId=&month=&year=
	API->>DB: SELECT same data
	DB-->>API: rows
	API->>API: Generate Excel workbook (ExcelJS)
	API-->>FE: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
	FE-->>U: Trigger file download
```

## Error & Retry Policy (Ringkas)
- Network failure: frontend menampilkan toast error + tombol retry.
- 401/403: redirect ke /login + hapus token.
- 5xx: toast error (aria-live polite) + logging request_id untuk korelasi.
- Idempotensi: POST /attendance/record menghapus & menulis ulang (safe repeat bila gagal sebelum respon).

## Status Utama
- Attendance Session: terjadwal → berlangsung → selesai/dibatalkan (saat ini baru berlangsung digunakan; finalisasi dapat ditambah nanti).


# Cara Menjalankan Aplikasi Absensi

## Prerequisites

### 1. Software yang Diperlukan
- **Node.js** (versi 18 atau lebih baru)
- **XAMPP** (untuk MySQL database)
- **Git** (untuk clone repository)
- **Code Editor** (VS Code recommended)

### 2. Verifikasi Installation
```bash
# Cek Node.js
node --version
npm --version

# Cek XAMPP MySQL
# Buka XAMPP Control Panel dan start MySQL
```

## Setup Database

### 1. Start XAMPP MySQL
1. Buka XAMPP Control Panel
2. Klik "Start" pada MySQL
3. Pastikan port 3306 tidak terpakai

### 2. Buat Database
1. Buka phpMyAdmin: http://localhost/phpmyadmin
2. Buat database baru: `db_HoyoKelas`
3. Import file `database.md` atau jalankan script bootstrap

### 3. Jalankan Bootstrap Script
```sql
-- Buka phpMyAdmin → SQL tab
-- Copy dan paste isi dari backend/scripts/dev_bootstrap.sql
-- Klik "Go" untuk menjalankan
```

## Setup Aplikasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd absensi-13
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env` di root project:

```env
PORT=3000

# MySQL via XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_HoyoKelas

# Auth
JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=24h

# Node env (dev|production)
NODE_ENV=development
```

### 4. Verifikasi Setup
```bash
# Cek apakah semua dependencies terinstall
npm list --depth=0

# Cek apakah .env sudah benar
cat .env
```

## Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di: http://localhost:3000

### Production Mode
```bash
npm run build
npm start
```

## Testing Aplikasi

### 1. Login Test
1. Buka http://localhost:3000
2. Akan redirect ke login page
3. Login dengan:
   - Username: `admin`
   - Password: `admin123`

### 2. Feature Test
1. **Dashboard**: Lihat ringkasan dan sesi hari ini
2. **Classes**: Lihat daftar kelas
3. **Users**: CRUD pengguna (admin only)
4. **Attendance**: Isi absensi (jika ada jadwal)
5. **Reports**: Lihat laporan dan export Excel

### 3. API Test
```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Troubleshooting

### Error: "MySQL terkoneksi"
**Penyebab**: XAMPP MySQL tidak berjalan atau kredensial salah
**Solusi**:
1. Start MySQL di XAMPP Control Panel
2. Cek kredensial di `.env`
3. Pastikan database `db_HoyoKelas` sudah dibuat

### Error: "secretOrPrivateKey must have a value"
**Penyebab**: `JWT_SECRET` tidak diisi di `.env`
**Solusi**:
1. Pastikan file `.env` ada di root project
2. Isi `JWT_SECRET=dev_secret_change_me`
3. Restart server

### Error: "EADDRINUSE: address already in use :::3000"
**Penyebab**: Port 3000 sudah terpakai
**Solusi**:
```bash
# Cek process yang menggunakan port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Atau ganti port di .env
PORT=3001
```

### Error: "Module not found"
**Penyebab**: Dependencies tidak terinstall
**Solusi**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module 'helmet'"
**Penyebab**: Backend dependencies tidak terinstall
**Solusi**:
```bash
# Install backend dependencies
npm install helmet morgan express-rate-limit mysql2 bcryptjs jsonwebtoken exceljs
```

## Development Workflow

### 1. File Structure
```
absensi-13/
├── server/index.js          # Entry point
├── backend/routes/          # API endpoints
├── src/app/                 # Next.js pages
├── src/components/          # React components
└── docs/                    # Documentation
```

### 2. Hot Reload
- Server akan restart otomatis saat ada perubahan di `backend/`
- Next.js akan hot reload saat ada perubahan di `src/`

### 3. Database Changes
- Edit schema di `database.md`
- Jalankan SQL di phpMyAdmin
- Update API routes jika perlu

### 4. Adding New Features
1. Buat API endpoint di `backend/routes/`
2. Buat frontend page di `src/app/`
3. Update `src/lib/api.ts` untuk API client
4. Test end-to-end

## Deployment

### 1. Production Build
```bash
npm run build
```

### 2. Environment Variables
- Set `NODE_ENV=production`
- Gunakan strong `JWT_SECRET`
- Konfigurasi database production

### 3. Process Manager
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/index.js --name "absensi-app"

# Monitor
pm2 status
pm2 logs absensi-app
```

## Monitoring & Logs

### 1. Application Logs
```bash
# Development logs
npm run dev

# Production logs
pm2 logs absensi-app
```

### 2. Database Logs
- XAMPP logs: `C:\xampp\mysql\data\mysql_error.log`
- phpMyAdmin untuk query monitoring

### 3. Performance Monitoring
- Browser DevTools untuk frontend
- Node.js profiling untuk backend
- MySQL slow query log

## Security Checklist

### 1. Development
- [ ] JWT_SECRET tidak di-commit ke git
- [ ] Database credentials aman
- [ ] Rate limiting aktif
- [ ] Input validation

### 2. Production
- [ ] HTTPS enabled
- [ ] Strong JWT secret
- [ ] Database backup
- [ ] Error logging
- [ ] Security headers

## Support

### 1. Documentation
- `docs/architecture.md` - Arsitektur aplikasi
- `docs/flows.md` - Alur data dan interaksi
- `docs/openapi.yaml` - API documentation
- `database.md` - Database schema

### 2. Issues
- Cek logs untuk error details
- Verifikasi environment setup
- Test dengan data minimal
- Dokumentasikan error untuk debugging

### 3. Community
- Stack Overflow untuk technical issues
- GitHub Issues untuk bug reports
- Team chat untuk quick questions

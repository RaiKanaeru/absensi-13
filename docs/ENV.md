# Konfigurasi Environment

Salin nilai berikut ke file `.env` di root proyek (buat baru jika belum ada).

Catatan: beberapa tooling melarang membuat file dot (.*) via editor otomatis. Jika tidak bisa membuat `.env` dari sini, buat manual via File Explorer/VS Code Terminal.

```
PORT=3000

# MySQL via XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_HoyoKelas

# Auth
JWT_SECRET=change_me_dev
JWT_EXPIRES_IN=24h

# Node env (dev|production)
NODE_ENV=development
```

Setelah membuat `.env`, restart dev server:

```powershell
npm run dev
```

## Troubleshooting

### Error: "secretOrPrivateKey must have a value"
- Pastikan `JWT_SECRET` sudah diisi di file `.env`
- Restart server setelah mengubah `.env`

### Error: "MySQL terkoneksi"
- Pastikan XAMPP MySQL berjalan di port 3306
- Periksa kredensial DB di `.env`

### Login gagal
- Pastikan database `db_HoyoKelas` sudah dibuat
- Jalankan `backend/scripts/dev_bootstrap.sql` untuk seed data admin
- Login dengan: username: `admin`, password: `admin123`

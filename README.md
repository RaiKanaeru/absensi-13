# Smart Attend - Sistem Absensi SMKN 13 Bandung

Sistem absensi digital komprehensif dengan fitur AI-powered analytics untuk manajemen kehadiran siswa dan guru.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/RaiKanaeru/absensi-13.git
cd absensi-13

# Install dependencies
npm install

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env file with your database configuration

# Run development servers
npm run dev        # Frontend (localhost:3000)
cd backend && npm run dev  # Backend (localhost:5000)
```

## 📚 Documentation

For comprehensive system documentation, please refer to:
- **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)** - Complete system documentation (Indonesian)
- **[Database Schema](./database.md)** - Database structure and relationships
- **[Blueprint](./docs/blueprint.md)** - System features and requirements

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MySQL
- **AI**: Google Genkit for predictive analytics
- **Security**: JWT, bcrypt, Helmet, Rate limiting

## 📊 Features

- ✅ Multi-role user management (Admin, Teacher, Student)
- ✅ Real-time attendance tracking per subject hour
- ✅ AI-powered attendance predictions and alerts
- ✅ Comprehensive reporting and analytics
- ✅ Mobile-responsive interface
- ✅ Advanced security and audit logging
- ✅ Export capabilities (Excel, PDF)

## 🏫 Designed for Indonesian Schools

Built specifically for SMK (Vocational High School) system with:
- Grade levels: X, XI, XII, XIII
- Major support: AK, TKJ, RPL
- Indonesian academic calendar
- Localized interface and reports

## 🤝 Contributing

Please read the [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md) for detailed information about the system architecture and development guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*© 2024 SMKN 13 Bandung. Smart Attend System.*

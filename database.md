-- =====================================================
-- SKEMA DATABASE SISTEM ABSENSI KELAS SMKN 13 BANDUNG
-- Fokus: Absensi per jam mata pelajaran dengan keamanan tinggi
-- =====================================================

-- 1. Tabel school_years (Tahun Ajaran)
CREATE TABLE school_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL UNIQUE, -- Contoh: '2025/2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

-- 2. Tabel users (Sistem Login dengan Keamanan)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32) NOT NULL, -- Salt untuk kata sandi
    role ENUM('admin', 'guru', 'wali_kelas', 'siswa') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INT DEFAULT 0, -- Penghitung gagal login
    locked_until TIMESTAMP NULL, -- Waktu pembukaan kunci akun
    last_login TIMESTAMP NULL,
    last_ip VARCHAR(45), -- Mendukung IPv6
    session_token VARCHAR(255) NULL, -- Token untuk manajemen sesi
    token_expires TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_session_token (session_token),
    INDEX idx_active (is_active)
);

-- 3. Tabel teachers (Data Guru)
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nip VARCHAR(25) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nip (nip),
    INDEX idx_active (is_active)
);

-- 4. Tabel subjects (Mata Pelajaran)
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    subject_type ENUM('teori', 'praktik') DEFAULT 'teori',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (subject_code),
    INDEX idx_active (is_active)
);

-- 5. Tabel classes (Kelas)
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL, -- Contoh: X AK 1, XI TKJ 2
    grade_level ENUM('X', 'XI', 'XII', 'XIII') NOT NULL,
    major VARCHAR(10) NOT NULL, -- Jurusan: AK, TKJ, RPL
    class_number INT NOT NULL,
    homeroom_teacher_id INT,
    school_year_id INT NOT NULL,
    capacity INT DEFAULT 36,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class (class_name, school_year_id),
    INDEX idx_school_year (school_year_id),
    INDEX idx_grade_major (grade_level, major)
);

-- 6. Tabel students (Data Siswa)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    phone_number VARCHAR(20),
    parent_phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_nis (nis),
    INDEX idx_nisn (nisn),
    INDEX idx_active (is_active)
);

-- 7. Tabel student_enrollments (Kelas Siswa per Tahun Ajaran)
CREATE TABLE student_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    school_year_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('aktif', 'pindah', 'keluar') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, school_year_id),
    INDEX idx_class_year (class_id, school_year_id),
    INDEX idx_status (status)
);

-- 8. Tabel subject_schedules (Jadwal Mata Pelajaran per Kelas)
CREATE TABLE subject_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    school_year_id INT NOT NULL,
    day_of_week ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu') NOT NULL,
    hour_sequence INT NOT NULL, -- Jam ke- (1,2,3,4,5,6,7,8,9,10)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_schedule (class_id, day_of_week, hour_sequence, school_year_id),
    INDEX idx_class_day (class_id, day_of_week),
    INDEX idx_teacher_day (teacher_id, day_of_week),
    INDEX idx_active (is_active)
);

-- 9. Tabel attendance_sessions (Sesi Absensi per Jam Pelajaran)
CREATE TABLE attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    session_date DATE NOT NULL,
    session_hour INT NOT NULL, -- Jam ke-
    teacher_id INT NOT NULL,
    session_status ENUM('terjadwal', 'berlangsung', 'selesai', 'dibatalkan') DEFAULT 'terjadwal',
    start_time TIMESTAMP NULL, -- Kapan guru mulai absen
    end_time TIMESTAMP NULL, -- Kapan guru selesai absen
    total_students INT DEFAULT 0,
    present_count INT DEFAULT 0,
    absent_count INT DEFAULT 0,
    notes TEXT,
    created_by_teacher_id INT,
    ip_address VARCHAR(45), -- IP untuk pelacakan
    device_info VARCHAR(255), -- Info perangkat
    location_info VARCHAR(255), -- Info lokasi/ruangan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES subject_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_session (schedule_id, session_date, session_hour),
    INDEX idx_date_hour (session_date, session_hour),
    INDEX idx_teacher_date (teacher_id, session_date),
    INDEX idx_status (session_status)
);

-- 10. Tabel student_attendances (Absensi Siswa per Jam Pelajaran)
CREATE TABLE student_attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat') NOT NULL,
    arrival_time TIME NULL, -- Waktu kedatangan jika terlambat
    notes TEXT,
    recorded_by_teacher_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_session (session_id, student_id),
    INDEX idx_student_date (student_id, recorded_at),
    INDEX idx_status (status),
    INDEX idx_session_status (session_id, status)
);

-- 11. Tabel teacher_attendances (Kehadiran Guru Mengajar)
CREATE TABLE teacher_attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    schedule_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    session_hour INT NOT NULL,
    status ENUM('Hadir', 'Sakit', 'Izin', 'Alpa', 'Diganti', 'Terlambat') NOT NULL,
    arrival_time TIMESTAMP NULL,
    departure_time TIMESTAMP NULL,
    substitute_teacher_id INT NULL, -- Guru pengganti
    notes TEXT,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES subject_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (substitute_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY unique_teacher_session (teacher_id, schedule_id, attendance_date, session_hour),
    INDEX idx_teacher_date (teacher_id, attendance_date),
    INDEX idx_status (status),
    INDEX idx_substitute (substitute_teacher_id)
);

-- 12. Tabel monthly_student_recaps (Rekap Absensi Siswa Bulanan)
CREATE TABLE monthly_student_recaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    school_year_id INT NOT NULL,
    month TINYINT NOT NULL, -- 1-12
    year YEAR NOT NULL,
    total_sessions INT DEFAULT 0, -- Total jam pelajaran dalam bulan
    total_hadir INT DEFAULT 0,
    total_sakit INT DEFAULT 0,
    total_izin INT DEFAULT 0,
    total_alpa INT DEFAULT 0,
    total_terlambat INT DEFAULT 0,
    percentage_hadir DECIMAL(5,2) DEFAULT 0.00,
    percentage_tidak_hadir DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_monthly_recap (student_id, month, year, school_year_id),
    INDEX idx_class_month (class_id, year, month),
    INDEX idx_year_month (school_year_id, year, month)
);

-- 13. Tabel monthly_teacher_recaps (Rekap Kehadiran Guru Bulanan)
CREATE TABLE monthly_teacher_recaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    school_year_id INT NOT NULL,
    month TINYINT NOT NULL,
    year YEAR NOT NULL,
    total_scheduled_sessions INT DEFAULT 0, -- Total jam mengajar terjadwal
    total_hadir INT DEFAULT 0,
    total_sakit INT DEFAULT 0,
    total_izin INT DEFAULT 0,
    total_alpa INT DEFAULT 0,
    total_diganti INT DEFAULT 0,
    total_terlambat INT DEFAULT 0,
    percentage_hadir DECIMAL(5,2) DEFAULT 0.00,
    percentage_tidak_hadir DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_monthly (teacher_id, month, year, school_year_id),
    INDEX idx_teacher_month (teacher_id, year, month),
    INDEX idx_year_month (school_year_id, year, month)
);

-- 14. Tabel daily_class_recaps (Rekap Harian per Kelas)
CREATE TABLE daily_class_recaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    recap_date DATE NOT NULL,
    total_sessions INT DEFAULT 0, -- Total jam pelajaran hari itu
    total_students INT DEFAULT 0,
    avg_hadir DECIMAL(5,2) DEFAULT 0.00,
    avg_tidak_hadir DECIMAL(5,2) DEFAULT 0.00,
    sessions_completed INT DEFAULT 0, -- Jam pelajaran yang terlaksana
    sessions_cancelled INT DEFAULT 0, -- Jam pelajaran yang dibatalkan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_class (class_id, recap_date),
    INDEX idx_class_date (class_id, recap_date),
    INDEX idx_date (recap_date)
);

-- 15. Tabel activity_logs (Log Aktivitas Sistem untuk Keamanan)
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity_type ENUM('login', 'logout', 'buat_absensi', 'ubah_absensi', 'hapus_absensi', 'lihat_laporan', 'akses_sistem') NOT NULL,
    table_affected VARCHAR(50),
    record_id INT,
    old_values JSON, -- Data lama (untuk ubah/hapus)
    new_values JSON, -- Data baru (untuk buat/ubah)
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    location_info VARCHAR(255),
    is_suspicious BOOLEAN DEFAULT FALSE, -- Tanda untuk aktivitas mencurigakan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_activity (user_id, activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_suspicious (is_suspicious),
    INDEX idx_table_record (table_affected, record_id)
);

-- 16. Tabel security_incidents (Insiden Keamanan)
CREATE TABLE security_incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    incident_type ENUM('gagal_login_berulang', 'lokasi_mencurigakan', 'aktivitas_tidak_wajar', 'manipulasi_data', 'akses_tidak_sah') NOT NULL,
    severity ENUM('rendah', 'sedang', 'tinggi', 'kritis') DEFAULT 'sedang',
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    additional_data JSON,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_incident (user_id, incident_type),
    INDEX idx_severity (severity),
    INDEX idx_resolved (is_resolved),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- VIEWS UNTUK KEMUDAHAN KUERI DAN LAPORAN
-- =====================================================

-- View siswa dengan kelas aktif
CREATE VIEW lihat_siswa_aktif AS
SELECT 
    s.id, s.nis, s.nisn, s.full_name, s.gender, s.phone_number,
    c.class_name, c.grade_level, c.major,
    t.full_name as wali_kelas,
    sy.year_name as tahun_ajaran
FROM students s
JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'aktif'
JOIN classes c ON se.class_id = c.id
JOIN school_years sy ON se.school_year_id = sy.id AND sy.is_active = TRUE
LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
WHERE s.is_active = TRUE;

-- View jadwal lengkap hari ini
CREATE VIEW lihat_jadwal_hari_ini AS
SELECT 
    ss.id, ss.day_of_week, ss.hour_sequence, ss.start_time, ss.end_time, ss.room,
    c.class_name, c.grade_level, c.major,
    sub.subject_name, sub.subject_type,
    t.full_name as nama_guru, t.nip,
    sy.year_name as tahun_ajaran,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM attendance_sessions ats 
            WHERE ats.schedule_id = ss.id 
            AND ats.session_date = CURDATE()
            AND ats.session_hour = ss.hour_sequence
        ) THEN 'sesi_dibuat' 
        ELSE 'menunggu' 
    END as status_sesi
FROM subject_schedules ss
JOIN classes c ON ss.class_id = c.id
JOIN subjects sub ON ss.subject_id = sub.id
JOIN teachers t ON ss.teacher_id = t.id
JOIN school_years sy ON ss.school_year_id = sy.id AND sy.is_active = TRUE
WHERE ss.is_active = TRUE
AND ss.day_of_week = DAYNAME(CURDATE())
ORDER BY ss.hour_sequence;

-- View rekap absensi harian per kelas
CREATE VIEW lihat_rekap_absensi_harian AS
SELECT 
    ats.session_date,
    c.class_name,
    sub.subject_name,
    t.full_name as nama_guru,
    ats.session_hour,
    ats.total_students,
    ats.present_count,
    ats.absent_count,
    ROUND((ats.present_count / ats.total_students) * 100, 2) as persentase_kehadiran,
    ats.session_status
FROM attendance_sessions ats
JOIN subject_schedules ss ON ats.schedule_id = ss.id
JOIN classes c ON ss.class_id = c.id
JOIN subjects sub ON ss.subject_id = sub.id
JOIN teachers t ON ss.teacher_id = t.id
WHERE ats.session_status = 'selesai';

-- View rekap ketidakhadiran siswa
CREATE VIEW lihat_rekap_ketidakhadiran_siswa AS
SELECT 
    s.nis, s.full_name, c.class_name,
    msr.month, msr.year,
    msr.total_sessions,
    msr.total_hadir,
    msr.total_sakit,
    msr.total_izin,
    msr.total_alpa,
    msr.total_terlambat,
    msr.percentage_hadir,
    msr.percentage_tidak_hadir,
    CASE 
        WHEN msr.percentage_tidak_hadir >= 20 THEN 'Kritis'
        WHEN msr.percentage_tidak_hadir >= 10 THEN 'Perhatian'
        ELSE 'Normal'
    END as status_kehadiran
FROM monthly_student_recaps msr
JOIN students s ON msr.student_id = s.id
JOIN classes c ON msr.class_id = c.id;

-- View rekap ketidakhadiran guru
CREATE VIEW lihat_rekap_ketidakhadiran_guru AS
SELECT 
    t.nip, t.full_name,
    mtr.month, mtr.year,
    mtr.total_scheduled_sessions,
    mtr.total_hadir,
    mtr.total_sakit,
    mtr.total_izin,
    mtr.total_alpa,
    mtr.total_diganti,
    mtr.percentage_hadir,
    mtr.percentage_tidak_hadir,
    CASE 
        WHEN mtr.percentage_tidak_hadir >= 15 THEN 'Kritis'
        WHEN mtr.percentage_tidak_hadir >= 8 THEN 'Perhatian'
        ELSE 'Normal'
    END as status_kehadiran
FROM monthly_teacher_recaps mtr
JOIN teachers t ON mtr.teacher_id = t.id;

-- =====================================================
-- STORED PROCEDURES UNTUK OPERASI PENTING
-- =====================================================

DELIMITER //

-- Prosedur untuk membuat sesi absensi
CREATE PROCEDURE BuatSesiAbsensi(
    IN p_id_jadwal INT,
    IN p_tanggal_sesi DATE,
    IN p_jam_sesi INT,
    IN p_id_guru INT,
    IN p_ip_address VARCHAR(45),
    IN p_info_perangkat VARCHAR(255),
    IN p_info_lokasi VARCHAR(255)
)
BEGIN
    DECLARE sesi_sudah_ada INT DEFAULT 0;
    DECLARE jumlah_total_siswa INT DEFAULT 0;
    
    -- Cek apakah sesi sudah ada
    SELECT COUNT(*) INTO sesi_sudah_ada 
    FROM attendance_sessions 
    WHERE schedule_id = p_id_jadwal 
    AND session_date = p_tanggal_sesi 
    AND session_hour = p_jam_sesi;
    
    IF sesi_sudah_ada = 0 THEN
        -- Hitung total siswa di kelas
        SELECT COUNT(*) INTO jumlah_total_siswa
        FROM student_enrollments se
        JOIN subject_schedules ss ON se.class_id = ss.class_id
        WHERE ss.id = p_id_jadwal 
        AND se.status = 'aktif';
        
        -- Buat sesi absensi baru
        INSERT INTO attendance_sessions (
            schedule_id, session_date, session_hour, teacher_id,
            session_status, start_time, total_students,
            ip_address, device_info, location_info, created_by_teacher_id
        ) VALUES (
            p_id_jadwal, p_tanggal_sesi, p_jam_sesi, p_id_guru,
            'berlangsung', NOW(), jumlah_total_siswa,
            p_ip_address, p_info_perangkat, p_info_lokasi, p_id_guru
        );
        
        -- Log aktivitas
        INSERT INTO activity_logs (
            user_id, activity_type, table_affected, record_id,
            new_values, ip_address, device_info, location_info
        ) VALUES (
            (SELECT user_id FROM teachers WHERE id = p_id_guru),
            'buat_absensi', 'attendance_sessions', LAST_INSERT_ID(),
            JSON_OBJECT('id_jadwal', p_id_jadwal, 'tanggal_sesi', p_tanggal_sesi, 'jam_sesi', p_jam_sesi),
            p_ip_address, p_info_perangkat, p_info_lokasi
        );
        
        SELECT LAST_INSERT_ID() as id_sesi, 'SUKSES' as status;
    ELSE
        SELECT 0 as id_sesi, 'SESI_SUDAH_ADA' as status;
    END IF;
END //

-- Prosedur untuk finalisasi sesi absensi
CREATE PROCEDURE FinalisasiSesiAbsensi(
    IN p_id_sesi INT,
    IN p_id_guru INT,
    IN p_catatan TEXT
)
BEGIN
    DECLARE v_jumlah_hadir INT DEFAULT 0;
    DECLARE v_jumlah_absen INT DEFAULT 0;
    
    -- Hitung jumlah hadir dan tidak hadir
    SELECT 
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status != 'Hadir' THEN 1 ELSE 0 END)
    INTO v_jumlah_hadir, v_jumlah_absen
    FROM student_attendances
    WHERE session_id = p_id_sesi;
    
    -- Update sesi absensi
    UPDATE attendance_sessions 
    SET 
        session_status = 'selesai',
        end_time = NOW(),
        present_count = v_jumlah_hadir,
        absent_count = v_jumlah_absen,
        notes = p_catatan,
        updated_at = NOW()
    WHERE id = p_id_sesi;
    
    -- Log aktivitas
    INSERT INTO activity_logs (
        user_id, activity_type, table_affected, record_id,
        new_values
    ) VALUES (
        (SELECT user_id FROM teachers WHERE id = p_id_guru),
        'ubah_absensi', 'attendance_sessions', p_id_sesi,
        JSON_OBJECT('status_sesi', 'selesai', 'jumlah_hadir', v_jumlah_hadir, 'jumlah_absen', v_jumlah_absen)
    );
    
    SELECT 'SUKSES' as status, v_jumlah_hadir as jumlah_hadir, v_jumlah_absen as jumlah_absen;
END //

-- Prosedur untuk membuat rekap bulanan siswa
CREATE PROCEDURE BuatRekapBulananSiswa(
    IN p_bulan INT,
    IN p_tahun YEAR,
    IN p_id_tahun_ajaran INT
)
BEGIN
    INSERT INTO monthly_student_recaps (
        student_id, class_id, school_year_id, month, year,
        total_sessions, total_hadir, total_sakit, total_izin, 
        total_alpa, total_terlambat, percentage_hadir, percentage_tidak_hadir
    )
    SELECT 
        s.id,
        se.class_id,
        se.school_year_id,
        p_bulan,
        p_tahun,
        COUNT(sa.id) as total_sesi,
        SUM(CASE WHEN sa.status = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN sa.status = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN sa.status = 'Izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN sa.status = 'Alpa' THEN 1 ELSE 0 END) as total_alpa,
        SUM(CASE WHEN sa.status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        ROUND((SUM(CASE WHEN sa.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(sa.id)) * 100, 2) as persentase_hadir,
        ROUND((SUM(CASE WHEN sa.status != 'Hadir' THEN 1 ELSE 0 END) / COUNT(sa.id)) * 100, 2) as persentase_tidak_hadir
    FROM students s
    JOIN student_enrollments se ON s.id = se.student_id 
    JOIN student_attendances sa ON s.id = sa.student_id
    JOIN attendance_sessions ats ON sa.session_id = ats.id
    WHERE se.school_year_id = p_id_tahun_ajaran
    AND se.status = 'aktif'
    AND MONTH(ats.session_date) = p_bulan
    AND YEAR(ats.session_date) = p_tahun
    AND s.is_active = TRUE
    GROUP BY s.id, se.class_id, se.school_year_id
    ON DUPLICATE KEY UPDATE
        total_sessions = VALUES(total_sessions),
        total_hadir = VALUES(total_hadir),
        total_sakit = VALUES(total_sakit),
        total_izin = VALUES(total_izin),
        total_alpa = VALUES(total_alpa),
        total_terlambat = VALUES(total_terlambat),
        percentage_hadir = VALUES(percentage_hadir),
        percentage_tidak_hadir = VALUES(percentage_tidak_hadir),
        updated_at = NOW();
    
    SELECT 'SUKSES' as status, ROW_COUNT() as baris_terpengaruh;
END //

-- Prosedur untuk membuat rekap bulanan guru
CREATE PROCEDURE BuatRekapBulananGuru(
    IN p_bulan INT,
    IN p_tahun YEAR,
    IN p_id_tahun_ajaran INT
)
BEGIN
    INSERT INTO monthly_teacher_recaps (
        teacher_id, school_year_id, month, year,
        total_scheduled_sessions, total_hadir, total_sakit, total_izin,
        total_alpa, total_diganti, total_terlambat, 
        percentage_hadir, percentage_tidak_hadir
    )
    SELECT 
        t.id,
        p_id_tahun_ajaran,
        p_bulan,
        p_tahun,	
        COUNT(ta.id) as total_sesi_terjadwal,
        SUM(CASE WHEN ta.status = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN ta.status = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN ta.status = 'Izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN ta.status = 'Alpa' THEN 1 ELSE 0 END) as total_alpa,
        SUM(CASE WHEN ta.status = 'Diganti' THEN 1 ELSE 0 END) as total_diganti,
        SUM(CASE WHEN ta.status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        ROUND((SUM(CASE WHEN ta.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(ta.id)) * 100, 2) as persentase_hadir,
        ROUND((SUM(CASE WHEN ta.status != 'Hadir' AND ta.status != 'Diganti' THEN 1 ELSE 0 END) / COUNT(ta.id)) * 100, 2) as persentase_tidak_hadir
    FROM teachers t
    LEFT JOIN teacher_attendances ta ON t.id = ta.teacher_id
    WHERE t.is_active = TRUE
    AND MONTH(ta.attendance_date) = p_bulan
    AND YEAR(ta.attendance_date) = p_tahun
    GROUP BY t.id
    ON DUPLICATE KEY UPDATE
        total_scheduled_sessions = VALUES(total_scheduled_sessions),
        total_hadir = VALUES(total_hadir),
        total_sakit = VALUES(total_sakit),
        total_izin = VALUES(total_izin),
        total_alpa = VALUES(total_alpa),
        total_diganti = VALUES(total_diganti),
        total_terlambat = VALUES(total_terlambat),
        percentage_hadir = VALUES(percentage_hadir),
        percentage_tidak_hadir = VALUES(percentage_tidak_hadir),
        updated_at = NOW();

    SELECT 'SUKSES' as status, ROW_COUNT() as baris_terpengaruh;
END //

DELIMITER ;

-- =====================================================
-- INSERT DATA AWAL (SEEDING)
-- =====================================================

-- Tahun Ajaran
INSERT INTO school_years (year_name, start_date, end_date, is_active) 
VALUES ('2025/2026', '2025-07-01', '2026-06-30', TRUE);

-- Pengguna Admin
INSERT INTO users (username, password_hash, salt, role) 
VALUES ('admin', 'placeholder_hash_kata_sandi', 'placeholder_salt', 'admin');

-- Pengaturan Sistem
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('school_name', 'SMK NEGERI 13 BANDUNG', 'Nama sekolah untuk ditampilkan di laporan');

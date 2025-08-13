-- =====================================================
-- DATABASE SCHEMA SISTEM ABSENSI KELAS SMKN 13 BANDUNG
-- Fokus: Absensi per jam mata pelajaran dengan keamanan tinggi
-- =====================================================

-- 1. Tabel school_years (Tahun Ajaran)
CREATE TABLE school_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL UNIQUE, -- '2025/2026'
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
    salt VARCHAR(32) NOT NULL, -- Salt untuk password
    role ENUM('admin', 'guru', 'wali_kelas', 'siswa') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INT DEFAULT 0, -- Counter untuk failed login
    locked_until TIMESTAMP NULL, -- Waktu unlock akun
    last_login TIMESTAMP NULL,
    last_ip VARCHAR(45), -- Support IPv6
    session_token VARCHAR(255) NULL, -- Token untuk session management
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
    class_name VARCHAR(50) NOT NULL, -- X AK 1, XI TKJ 2, etc
    grade_level ENUM('X', 'XI', 'XII', 'XIII') NOT NULL,
    major VARCHAR(10) NOT NULL, -- AK, TKJ, RPL
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
    status ENUM('active', 'transferred', 'dropped') DEFAULT 'active',
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
    hour_sequence INT NOT NULL, -- Jam ke berapa (1,2,3,4,5,6,7,8,9,10)
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
    session_hour INT NOT NULL, -- Jam ke berapa
    teacher_id INT NOT NULL,
    session_status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    start_time TIMESTAMP NULL, -- Kapan guru mulai absen
    end_time TIMESTAMP NULL, -- Kapan guru selesai absen
    total_students INT DEFAULT 0,
    present_count INT DEFAULT 0,
    absent_count INT DEFAULT 0,
    notes TEXT,
    created_by_teacher_id INT,
    ip_address VARCHAR(45), -- IP untuk tracking
    device_info VARCHAR(255), -- Info device
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
    activity_type ENUM('login', 'logout', 'create_attendance', 'update_attendance', 'delete_attendance', 'view_report', 'system_access') NOT NULL,
    table_affected VARCHAR(50),
    record_id INT,
    old_values JSON, -- Data lama (untuk update/delete)
    new_values JSON, -- Data baru (untuk create/update)
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    location_info VARCHAR(255),
    is_suspicious BOOLEAN DEFAULT FALSE, -- Flag untuk aktivitas mencurigakan
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
    incident_type ENUM('multiple_failed_login', 'suspicious_location', 'unusual_activity', 'data_manipulation', 'unauthorized_access') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
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
-- VIEWS UNTUK KEMUDAHAN QUERY DAN LAPORAN
-- =====================================================

-- View siswa dengan kelas aktif
CREATE VIEW view_active_students AS
SELECT 
    s.id, s.nis, s.nisn, s.full_name, s.gender, s.phone_number,
    c.class_name, c.grade_level, c.major,
    t.full_name as homeroom_teacher,
    sy.year_name
FROM students s
JOIN student_enrollments se ON s.id = se.student_id AND se.status = 'active'
JOIN classes c ON se.class_id = c.id
JOIN school_years sy ON se.school_year_id = sy.id AND sy.is_active = TRUE
LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id
WHERE s.is_active = TRUE;

-- View jadwal lengkap hari ini
CREATE VIEW view_today_schedules AS
SELECT 
    ss.id, ss.day_of_week, ss.hour_sequence, ss.start_time, ss.end_time, ss.room,
    c.class_name, c.grade_level, c.major,
    sub.subject_name, sub.subject_type,
    t.full_name as teacher_name, t.nip,
    sy.year_name,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM attendance_sessions ats 
            WHERE ats.schedule_id = ss.id 
            AND ats.session_date = CURDATE()
            AND ats.session_hour = ss.hour_sequence
        ) THEN 'session_created' 
        ELSE 'pending' 
    END as session_status
FROM subject_schedules ss
JOIN classes c ON ss.class_id = c.id
JOIN subjects sub ON ss.subject_id = sub.id
JOIN teachers t ON ss.teacher_id = t.id
JOIN school_years sy ON ss.school_year_id = sy.id AND sy.is_active = TRUE
WHERE ss.is_active = TRUE
AND ss.day_of_week = DAYNAME(CURDATE())
ORDER BY ss.hour_sequence;

-- View rekap absensi harian per kelas
CREATE VIEW view_daily_attendance_summary AS
SELECT 
    ats.session_date,
    c.class_name,
    sub.subject_name,
    t.full_name as teacher_name,
    ats.session_hour,
    ats.total_students,
    ats.present_count,
    ats.absent_count,
    ROUND((ats.present_count / ats.total_students) * 100, 2) as attendance_percentage,
    ats.session_status
FROM attendance_sessions ats
JOIN subject_schedules ss ON ats.schedule_id = ss.id
JOIN classes c ON ss.class_id = c.id
JOIN subjects sub ON ss.subject_id = sub.id
JOIN teachers t ON ss.teacher_id = t.id
WHERE ats.session_status = 'completed';

-- View rekap ketidakhadiran siswa
CREATE VIEW view_student_absence_summary AS
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
CREATE VIEW view_teacher_absence_summary AS
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

-- Procedure untuk membuat sesi absensi
CREATE PROCEDURE CreateAttendanceSession(
    IN p_schedule_id INT,
    IN p_session_date DATE,
    IN p_session_hour INT,
    IN p_teacher_id INT,
    IN p_ip_address VARCHAR(45),
    IN p_device_info VARCHAR(255),
    IN p_location_info VARCHAR(255)
)
BEGIN
    DECLARE session_exists INT DEFAULT 0;
    DECLARE total_students_count INT DEFAULT 0;
    
    -- Cek apakah sesi sudah ada
    SELECT COUNT(*) INTO session_exists 
    FROM attendance_sessions 
    WHERE schedule_id = p_schedule_id 
    AND session_date = p_session_date 
    AND session_hour = p_session_hour;
    
    IF session_exists = 0 THEN
        -- Hitung total siswa di kelas
        SELECT COUNT(*) INTO total_students_count
        FROM student_enrollments se
        JOIN subject_schedules ss ON se.class_id = ss.class_id
        WHERE ss.id = p_schedule_id 
        AND se.status = 'active';
        
        -- Buat sesi absensi baru
        INSERT INTO attendance_sessions (
            schedule_id, session_date, session_hour, teacher_id,
            session_status, start_time, total_students,
            ip_address, device_info, location_info, created_by_teacher_id
        ) VALUES (
            p_schedule_id, p_session_date, p_session_hour, p_teacher_id,
            'ongoing', NOW(), total_students_count,
            p_ip_address, p_device_info, p_location_info, p_teacher_id
        );
        
        -- Log aktivitas
        INSERT INTO activity_logs (
            user_id, activity_type, table_affected, record_id,
            new_values, ip_address, device_info, location_info
        ) VALUES (
            (SELECT user_id FROM teachers WHERE id = p_teacher_id),
            'create_attendance', 'attendance_sessions', LAST_INSERT_ID(),
            JSON_OBJECT('schedule_id', p_schedule_id, 'session_date', p_session_date, 'session_hour', p_session_hour),
            p_ip_address, p_device_info, p_location_info
        );
        
        SELECT LAST_INSERT_ID() as session_id, 'SUCCESS' as status;
    ELSE
        SELECT 0 as session_id, 'SESSION_EXISTS' as status;
    END IF;
END //

-- Procedure untuk finalisasi sesi absensi
CREATE PROCEDURE FinalizeAttendanceSession(
    IN p_session_id INT,
    IN p_teacher_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_present_count INT DEFAULT 0;
    DECLARE v_absent_count INT DEFAULT 0;
    
    -- Hitung jumlah hadir dan tidak hadir
    SELECT 
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status != 'Hadir' THEN 1 ELSE 0 END)
    INTO v_present_count, v_absent_count
    FROM student_attendances
    WHERE session_id = p_session_id;
    
    -- Update sesi absensi
    UPDATE attendance_sessions 
    SET 
        session_status = 'completed',
        end_time = NOW(),
        present_count = v_present_count,
        absent_count = v_absent_count,
        notes = p_notes,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    -- Log aktivitas
    INSERT INTO activity_logs (
        user_id, activity_type, table_affected, record_id,
        new_values
    ) VALUES (
        (SELECT user_id FROM teachers WHERE id = p_teacher_id),
        'update_attendance', 'attendance_sessions', p_session_id,
        JSON_OBJECT('session_status', 'completed', 'present_count', v_present_count, 'absent_count', v_absent_count)
    );
    
    SELECT 'SUCCESS' as status, v_present_count as present_count, v_absent_count as absent_count;
END //

-- Procedure untuk membuat rekap bulanan siswa
CREATE PROCEDURE GenerateMonthlyStudentRecap(
    IN p_month INT,
    IN p_year YEAR,
    IN p_school_year_id INT
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
        p_month,
        p_year,
        COUNT(sa.id) as total_sessions,
        SUM(CASE WHEN sa.status = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN sa.status = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN sa.status = 'Izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN sa.status = 'Alpa' THEN 1 ELSE 0 END) as total_alpa,
        SUM(CASE WHEN sa.status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        ROUND((SUM(CASE WHEN sa.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(sa.id)) * 100, 2) as percentage_hadir,
        ROUND((SUM(CASE WHEN sa.status != 'Hadir' THEN 1 ELSE 0 END) / COUNT(sa.id)) * 100, 2) as percentage_tidak_hadir
    FROM students s
    JOIN student_enrollments se ON s.id = se.student_id 
    JOIN student_attendances sa ON s.id = sa.student_id
    JOIN attendance_sessions ats ON sa.session_id = ats.id
    WHERE se.school_year_id = p_school_year_id
    AND se.status = 'active'
    AND MONTH(ats.session_date) = p_month
    AND YEAR(ats.session_date) = p_year
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
    
    SELECT 'SUCCESS' as status, ROW_COUNT() as affected_rows;
END //

-- Procedure untuk membuat rekap bulanan guru
CREATE PROCEDURE GenerateMonthlyTeacherRecap(
    IN p_month INT,
    IN p_year YEAR,
    IN p_school_year_id INT
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
        p_school_year_id,
        p_month,
        p_year,
        COUNT(ta.id) as total_scheduled_sessions,
        SUM(CASE WHEN ta.status = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
        SUM(CASE WHEN ta.status = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN ta.status = 'Izin' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN ta.status = 'Alpa' THEN 1 ELSE 0 END) as total_alpa,
        SUM(CASE WHEN ta.status = 'Diganti' THEN 1 ELSE 0 END) as total_diganti,
        SUM(CASE WHEN ta.status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        ROUND((SUM(CASE WHEN ta.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(ta.id)) * 100, 2) as percentage_hadir,
        ROUND((SUM(CASE WHEN ta.status != 'Hadir' THEN 1 ELSE 0 END) / COUNT(ta.id)) * 100, 2) as percentage_tidak_hadir
    FROM teachers t
    JOIN teacher_attendances ta ON t.id = ta.teacher_id
    JOIN subject_schedules ss ON ta.schedule_id = ss.id
    WHERE ss.school_year_id = p_school_year_id
    AND MONTH(ta.attendance_date) = p_month
    AND YEAR(ta.attendance_date) = p_year
    AND t.is_active = TRUE
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
    
    SELECT 'SUCCESS' as status, ROW_COUNT() as affected_rows;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS UNTUK KEAMANAN DAN INTEGRITAS DATA
-- =====================================================

DELIMITER //

-- Trigger untuk log perubahan data penting
CREATE TRIGGER tr_student_attendances_audit
    AFTER UPDATE ON student_attendances
    FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (
            user_id, activity_type, table_affected, record_id,
            old_values, new_values, ip_address
        ) VALUES (
            (SELECT user_id FROM teachers WHERE id = NEW.recorded_by_teacher_id),
            'update_attendance', 'student_attendances', NEW.id,
            JSON_OBJECT('status', OLD.status, 'notes', OLD.notes),
            JSON_OBJECT('status', NEW.status, 'notes', NEW.notes),
            @current_ip_address
        );
    END IF;
END //

-- Trigger untuk auto-update rekap harian kelas
CREATE TRIGGER tr_update_daily_class_recap
    AFTER UPDATE ON attendance_sessions
    FOR EACH ROW
BEGIN
    IF OLD.session_status != 'completed' AND NEW.session_status = 'completed' THEN
        INSERT INTO daily_class_recaps (
            class_id, recap_date, total_sessions, total_students,
            avg_hadir, avg_tidak_hadir, sessions_completed
        )
        SELECT 
            ss.class_id,
            NEW.session_date,
            COUNT(ats.id) as total_sessions,
            AVG(ats.total_students) as total_students,
            AVG((ats.present_count / ats.total_students) * 100) as avg_hadir,
            AVG((ats.absent_count / ats.total_students) * 100) as avg_tidak_hadir,
            SUM(CASE WHEN ats.session_status = 'completed' THEN 1 ELSE 0 END) as sessions_completed
        FROM attendance_sessions ats
        JOIN subject_schedules ss ON ats.schedule_id = ss.id
        WHERE ss.class_id = (SELECT class_id FROM subject_schedules WHERE id = NEW.schedule_id)
        AND ats.session_date = NEW.session_date
        GROUP BY ss.class_id, ats.session_date
        ON DUPLICATE KEY UPDATE
            total_sessions = VALUES(total_sessions),
            total_students = VALUES(total_students),
            avg_hadir = VALUES(avg_hadir),
            avg_tidak_hadir = VALUES(avg_tidak_hadir),
            sessions_completed = VALUES(sessions_completed),
            updated_at = NOW();
    END IF;
END //

-- Trigger untuk deteksi login mencurigakan
CREATE TRIGGER tr_detect_suspicious_login
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    -- Deteksi login dari IP yang berbeda dalam waktu singkat
    IF OLD.last_login != NEW.last_login AND NEW.last_ip != OLD.last_ip THEN
        IF OLD.last_login > DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN
            INSERT INTO security_incidents (
                user_id, incident_type, severity, description, ip_address
            ) VALUES (
                NEW.id, 'suspicious_location', 'medium',
                CONCAT('Login dari IP berbeda dalam 1 jam. IP lama: ', OLD.last_ip, ', IP baru: ', NEW.last_ip),
                NEW.last_ip
            );
        END IF;
    END IF;
    
    -- Reset login attempts jika login berhasil
    IF OLD.last_login != NEW.last_login AND NEW.login_attempts > 0 THEN
        UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = NEW.id;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- FUNCTIONS UNTUK KALKULASI DAN VALIDASI
-- =====================================================

DELIMITER //

-- Function untuk menghitung persentase kehadiran siswa
CREATE FUNCTION GetStudentAttendancePercentage(
    p_student_id INT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_sessions INT DEFAULT 0;
    DECLARE present_sessions INT DEFAULT 0;
    DECLARE attendance_percentage DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as present
    INTO total_sessions, present_sessions
    FROM student_attendances sa
    JOIN attendance_sessions ats ON sa.session_id = ats.id
    WHERE sa.student_id = p_student_id
    AND ats.session_date BETWEEN p_start_date AND p_end_date;
    
    IF total_sessions > 0 THEN
        SET attendance_percentage = ROUND((present_sessions / total_sessions) * 100, 2);
    END IF;
    
    RETURN attendance_percentage;
END //

-- Function untuk validasi jam pelajaran
CREATE FUNCTION ValidateScheduleHour(
    p_class_id INT,
    p_day_of_week VARCHAR(10),
    p_hour_sequence INT,
    p_school_year_id INT
)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE hour_exists INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO hour_exists
    FROM subject_schedules
    WHERE class_id = p_class_id
    AND day_of_week = p_day_of_week
    AND hour_sequence = p_hour_sequence
    AND school_year_id = p_school_year_id
    AND is_active = TRUE;
    
    RETURN hour_exists = 0;
END //

-- Function untuk cek hak akses guru ke kelas
CREATE FUNCTION CheckTeacherClassAccess(
    p_teacher_id INT,
    p_class_id INT,
    p_school_year_id INT
)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE has_access INT DEFAULT 0;
    
    -- Cek apakah guru mengajar di kelas tersebut
    SELECT COUNT(*)
    INTO has_access
    FROM subject_schedules
    WHERE teacher_id = p_teacher_id
    AND class_id = p_class_id
    AND school_year_id = p_school_year_id
    AND is_active = TRUE;
    
    -- Atau apakah guru adalah wali kelas
    IF has_access = 0 THEN
        SELECT COUNT(*)
        INTO has_access
        FROM classes
        WHERE id = p_class_id
        AND homeroom_teacher_id = p_teacher_id
        AND school_year_id = p_school_year_id
        AND is_active = TRUE;
    END IF;
    
    RETURN has_access > 0;
END //

DELIMITER ;

-- =====================================================
-- INDEXES TAMBAHAN UNTUK OPTIMASI PERFORMANCE
-- =====================================================

-- Composite indexes untuk query yang sering digunakan
ALTER TABLE student_attendances ADD INDEX idx_student_session_status (student_id, session_id, status);
ALTER TABLE attendance_sessions ADD INDEX idx_date_status (session_date, session_status);
ALTER TABLE teacher_attendances ADD INDEX idx_teacher_date_status (teacher_id, attendance_date, status);
ALTER TABLE activity_logs ADD INDEX idx_user_type_created (user_id, activity_type, created_at);
ALTER TABLE monthly_student_recaps ADD INDEX idx_student_year_month (student_id, year, month);
ALTER TABLE monthly_teacher_recaps ADD INDEX idx_teacher_year_month (teacher_id, year, month);

-- Indexes untuk pencarian text
ALTER TABLE students ADD FULLTEXT INDEX idx_student_name_search (full_name);
ALTER TABLE teachers ADD FULLTEXT INDEX idx_teacher_name_search (full_name);
ALTER TABLE subjects ADD FULLTEXT INDEX idx_subject_search (subject_name);

-- =====================================================
-- SAMPLE DATA UNTUK TESTING
-- =====================================================

-- Insert tahun ajaran aktif
INSERT INTO school_years (year_name, start_date, end_date, is_active) VALUES
('2025/2026', '2025-07-01', '2026-06-30', TRUE);

-- Insert user admin untuk testing
INSERT INTO users (username, password_hash, salt, role, is_active) VALUES
('admin', SHA2(CONCAT('admin123', 'salt123'), 256), 'salt123', 'admin', TRUE);

-- Insert beberapa mata pelajaran berdasarkan dokumen
INSERT INTO subjects (subject_code, subject_name, subject_type, is_active) VALUES
('MAT-X', 'Matematika', 'teori', TRUE),
('IND-X', 'Bahasa Indonesia', 'teori', TRUE),
('ING-X', 'Bahasa Inggris', 'teori', TRUE),
('KIM-X', 'Kimia', 'teori', TRUE),
('DPK-AK', 'Dasar Program Keahlian', 'praktik', TRUE),
('ATG-AK', 'Analisis Titrimetri Gravimetri', 'praktik', TRUE),
('AKI-AK', 'Analisis Kimia Instrumen', 'praktik', TRUE),
('INF-TKJ', 'Informatika', 'teori', TRUE),
('TJKN-TKJ', 'Teknik Jaringan Komputer dan Telekomunikasi', 'praktik', TRUE),
('PPB-RPL', 'Pemrograman Perangkat Bergerak', 'praktik', TRUE);

-- =====================================================
-- SECURITY PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure untuk reset password dengan keamanan tinggi
CREATE PROCEDURE ResetUserPassword(
    IN p_user_id INT,
    IN p_new_password VARCHAR(255),
    IN p_admin_user_id INT
)
BEGIN
    DECLARE new_salt VARCHAR(32);
    DECLARE new_hash VARCHAR(255);
    
    -- Generate salt baru
    SET new_salt = SHA2(CONCAT(p_user_id, NOW(), RAND()), 256);
    SET new_salt = SUBSTR(new_salt, 1, 32);
    
    -- Hash password dengan salt
    SET new_hash = SHA2(CONCAT(p_new_password, new_salt), 256);
    
    -- Update password
    UPDATE users 
    SET password_hash = new_hash,
        salt = new_salt,
        password_changed_at = NOW(),
        must_change_password = TRUE,
        login_attempts = 0,
        locked_until = NULL
    WHERE id = p_user_id;
    
    -- Log aktivitas
    INSERT INTO activity_logs (
        user_id, activity_type, table_affected, record_id,
        new_values
    ) VALUES (
        p_admin_user_id, 'system_access', 'users', p_user_id,
        JSON_OBJECT('action', 'password_reset', 'target_user_id', p_user_id)
    );
    
    SELECT 'SUCCESS' as status;
END //

-- Procedure untuk lock user setelah failed login
CREATE PROCEDURE HandleFailedLogin(
    IN p_username VARCHAR(50),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE user_id INT;
    DECLARE current_attempts INT DEFAULT 0;
    DECLARE max_attempts INT DEFAULT 5;
    DECLARE lock_duration INT DEFAULT 30; -- minutes
    
    SELECT id, login_attempts INTO user_id, current_attempts
    FROM users 
    WHERE username = p_username AND is_active = TRUE;
    
    IF user_id IS NOT NULL THEN
        SET current_attempts = current_attempts + 1;
        
        IF current_attempts >= max_attempts THEN
            -- Lock user account
            UPDATE users 
            SET login_attempts = current_attempts,
                locked_until = DATE_ADD(NOW(), INTERVAL lock_duration MINUTE)
            WHERE id = user_id;
            
            -- Create security incident
            INSERT INTO security_incidents (
                user_id, incident_type, severity, description, ip_address, user_agent
            ) VALUES (
                user_id, 'multiple_failed_login', 'high',
                CONCAT('Account locked after ', max_attempts, ' failed login attempts'),
                p_ip_address, p_user_agent
            );
        ELSE
            UPDATE users 
            SET login_attempts = current_attempts
            WHERE id = user_id;
        END IF;
        
        -- Log failed attempt
        INSERT INTO activity_logs (
            user_id, activity_type, ip_address, user_agent
        ) VALUES (
            user_id, 'login', p_ip_address, p_user_agent
        );
    END IF;
    
    SELECT 'FAILED' as status, current_attempts as attempts, max_attempts as max_attempts;
END //

DELIMITER ;

-- =====================================================
-- BACKUP AND MAINTENANCE PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure untuk cleanup old logs (untuk maintenance)
CREATE PROCEDURE CleanupOldLogs(
    IN p_days_to_keep INT
)
BEGIN
    DECLARE rows_deleted INT DEFAULT 0;
    
    -- Delete old activity logs
    DELETE FROM activity_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days_to_keep DAY)
    AND is_suspicious = FALSE;
    
    SET rows_deleted = ROW_COUNT();
    
    -- Delete resolved security incidents older than 1 year
    DELETE FROM security_incidents 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY)
    AND is_resolved = TRUE;
    
    SELECT 'SUCCESS' as status, rows_deleted as activity_logs_deleted, ROW_COUNT() as incidents_deleted;
END //

-- Procedure untuk backup critical data
CREATE PROCEDURE BackupAttendanceData(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Create backup tables with timestamp
    SET @backup_suffix = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');
    
    SET @sql = CONCAT('CREATE TABLE attendance_sessions_backup_', @backup_suffix, ' AS SELECT * FROM attendance_sessions WHERE session_date BETWEEN ''', p_start_date, ''' AND ''', p_end_date, '''');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SET @sql = CONCAT('CREATE TABLE student_attendances_backup_', @backup_suffix, ' AS SELECT sa.* FROM student_attendances sa JOIN attendance_sessions ats ON sa.session_id = ats.id WHERE ats.session_date BETWEEN ''', p_start_date, ''' AND ''', p_end_date, '''');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT 'SUCCESS' as status, CONCAT('attendance_sessions_backup_', @backup_suffix) as sessions_table, CONCAT('student_attendances_backup_', @backup_suffix) as attendances_table;
END //

DELIMITER ;

-- =====================================================
-- FINAL NOTES DAN REKOMENDASI KEAMANAN
-- =====================================================

/*
REKOMENDASI KEAMANAN IMPLEMENTASI:

1. PASSWORD POLICY:
   - Minimum 8 karakter, kombinasi huruf, angka, simbol
   - Expire setiap 90 hari
   - Tidak boleh reuse 5 password terakhir

2. SESSION MANAGEMENT:
   - Session timeout 30 menit untuk siswa
   - Session timeout 60 menit untuk guru
   - Session timeout 120 menit untuk admin
   - Implementasi CSRF token

3. DATABASE SECURITY:
   - Gunakan prepared statements untuk semua query
   - Implement database user dengan privilege minimal
   - Enable binary logging untuk audit trail
   - Regular backup otomatis

4. APPLICATION SECURITY:
   - Input validation dan sanitization
   - SQL injection prevention
   - XSS protection
   - Rate limiting untuk API endpoints

5. MONITORING:
   - Real-time monitoring untuk suspicious activities
   - Alert system untuk security incidents
   - Regular security audit

6. DATA PRIVACY:
   - Encrypt sensitive data at rest
   - Implement data retention policy
   - GDPR compliance untuk data personal

7. BACKUP STRATEGY:
   - Daily incremental backup
   - Weekly full backup
   - Monthly archive to external storage
   - Test restore procedures regularly

8. ACCESS CONTROL:
   - Role-based access control (RBAC)
   - Principle of least privilege
   - Regular access review
   - Multi-factor authentication untuk admin
*/
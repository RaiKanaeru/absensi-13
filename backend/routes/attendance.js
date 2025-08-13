const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware untuk semua route
router.use(authenticateToken);
router.use(requireRole(['teacher', 'admin']));

// POST mencatat absensi
router.post('/record', async (req, res) => {
    try {
        const { schedule_id, attendance_date, records } = req.body;
        const teacher_id = req.user.role === 'teacher' ? req.user.id : req.body.recorded_by_teacher_id;

        if (!schedule_id || !attendance_date || !records || !Array.isArray(records)) {
            return res.status(400).json({
                success: false,
                message: 'Data absensi tidak lengkap'
            });
        }

        // Validasi tanggal
        const date = new Date(attendance_date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal tidak valid'
            });
        }

        // Cek apakah jadwal ada
        const [schedules] = await pool.execute(
            'SELECT * FROM schedules WHERE id = ?',
            [schedule_id]
        );

        if (schedules.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jadwal tidak ditemukan'
            });
        }

        const schedule = schedules[0];

        // Cek apakah guru yang login adalah guru yang mengajar di jadwal ini
        if (req.user.role === 'teacher' && schedule.teacher_id !== teacher_id) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki akses untuk mencatat absensi di jadwal ini'
            });
        }

        // Cek apakah siswa ada di kelas yang sama dengan jadwal
        const studentIds = records.map(record => record.student_id);
        const [students] = await pool.execute(
            'SELECT id FROM students WHERE id IN (?) AND class_id = ?',
            [studentIds, schedule.class_id]
        );

        if (students.length !== studentIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Beberapa siswa tidak ditemukan atau tidak berada di kelas yang sama'
            });
        }

        // Mulai transaksi
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Hapus absensi yang sudah ada untuk tanggal dan jadwal yang sama
            await connection.execute(
                'DELETE FROM attendance_records WHERE schedule_id = ? AND attendance_date = ?',
                [schedule_id, attendance_date]
            );

            // Insert absensi baru
            for (const record of records) {
                const { student_id, status } = record;

                if (!['Hadir', 'Sakit', 'Izin', 'Alpa', 'Dispen'].includes(status)) {
                    throw new Error(`Status absensi tidak valid: ${status}`);
                }

                await connection.execute(
                    'INSERT INTO attendance_records (student_id, schedule_id, attendance_date, status, recorded_by_teacher_id) VALUES (?, ?, ?, ?, ?)',
                    [student_id, schedule_id, attendance_date, status, teacher_id]
                );
            }

            await connection.commit();

            res.json({
                success: true,
                message: 'Absensi berhasil dicatat',
                data: {
                    schedule_id,
                    attendance_date,
                    total_records: records.length
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Record attendance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Terjadi kesalahan server'
        });
    }
});

// GET absensi berdasarkan jadwal dan tanggal
router.get('/schedule/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tanggal diperlukan'
            });
        }

        // Cek apakah jadwal ada
        const [schedules] = await pool.execute(
            'SELECT * FROM schedules WHERE id = ?',
            [scheduleId]
        );

        if (schedules.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jadwal tidak ditemukan'
            });
        }

        const schedule = schedules[0];

        // Ambil daftar siswa di kelas
        const [students] = await pool.execute(
            'SELECT id, nis, full_name, gender FROM students WHERE class_id = ? ORDER BY full_name',
            [schedule.class_id]
        );

        // Ambil data absensi yang sudah ada
        const [attendanceRecords] = await pool.execute(
            'SELECT student_id, status FROM attendance_records WHERE schedule_id = ? AND attendance_date = ?',
            [scheduleId, date]
        );

        // Gabungkan data siswa dengan absensi
        const attendanceData = students.map(student => {
            const attendance = attendanceRecords.find(record => record.student_id === student.id);
            return {
                ...student,
                status: attendance ? attendance.status : null
            };
        });

        res.json({
            success: true,
            data: {
                schedule,
                attendance_date: date,
                students: attendanceData
            }
        });

    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// GET jadwal mengajar guru untuk hari ini
router.get('/teacher/:teacherId/today', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const today = new Date();
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayName = dayNames[today.getDay()];

        const [schedules] = await pool.execute(
            `SELECT s.*, c.class_name, sub.subject_name, sub.subject_code
             FROM schedules s
             JOIN classes c ON s.class_id = c.id
             JOIN subjects sub ON s.subject_id = sub.id
             WHERE s.teacher_id = ? AND s.day_of_week = ?
             ORDER BY s.start_time`,
            [teacherId, todayName]
        );

        res.json({
            success: true,
            data: schedules
        });

    } catch (error) {
        console.error('Get teacher schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;


const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getTodaysScheduleSchema,
  getScheduleSchema,
  recordAttendanceSchema,
} = require('../validators/attendance');

const router = express.Router();
router.use(authenticateToken);
// Sesuai database.md, role utama: admin, guru, wali_kelas
router.use(requireRole(['admin','guru','wali_kelas']));

function dayNameId(date = new Date()) {
  const names = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return names[date.getDay()];
}

router.get('/teacher/:teacherId/today', validate(getTodaysScheduleSchema), async (req, res) => {
  try {
    const todayName = dayNameId();
    const [sy] = await pool.execute('SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1');
    if (!sy.length) return res.json({ success: true, data: [] });
    const schoolYearId = sy[0].id;

    const [rows] = await pool.execute(
      `SELECT ss.id, ss.start_time, ss.end_time, c.class_name, sub.subject_name
       FROM subject_schedules ss
       JOIN classes c ON c.id = ss.class_id
       JOIN subjects sub ON sub.id = ss.subject_id
       WHERE ss.teacher_id = ? AND ss.school_year_id = ? AND ss.day_of_week = ? AND ss.is_active = TRUE
       ORDER BY ss.start_time`, [req.params.teacherId, schoolYearId, todayName]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

// GET daftar siswa dan status pada tanggal
router.get('/schedule/:scheduleId', validate(getScheduleSchema), async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const date = req.query.date;

    const [ss] = await pool.execute('SELECT * FROM subject_schedules WHERE id = ?', [scheduleId]);
    if (!ss.length) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });

    const [sy] = await pool.execute('SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1');
    const schoolYearId = sy[0]?.id;

    // Ambil siswa kelas aktif pada tahun ajaran aktif
    const [students] = await pool.execute(
      `SELECT s.id, s.nis, s.full_name, s.gender
       FROM student_enrollments se JOIN students s ON s.id = se.student_id
       WHERE se.class_id = ? AND se.school_year_id = ? AND se.status = 'aktif'
       ORDER BY s.full_name`, [ss[0].class_id, schoolYearId]
    );

    // Pastikan ada session (gunakan session_hour = 1 secara default)
    const [exists] = await pool.execute(
      `SELECT id FROM attendance_sessions WHERE schedule_id = ? AND session_date = ? AND session_hour = 1`,
      [scheduleId, date]
    );
    let sessionId = exists[0]?.id;
    if (!sessionId) {
      const [ins] = await pool.execute(
        `INSERT INTO attendance_sessions (schedule_id, session_date, session_hour, teacher_id, session_status, start_time, total_students)
         VALUES (?, ?, 1, ?, 'berlangsung', NOW(), ?)`,
        [scheduleId, date, ss[0].teacher_id, students.length]
      );
      sessionId = ins.insertId;
    }

    const [att] = await pool.execute(
      `SELECT student_id, status FROM student_attendances WHERE session_id = ?`,
      [sessionId]
    );

    const result = students.map(s => {
      const a = att.find(x => x.student_id === s.id);
      return { id: s.id, nis: s.nis, full_name: s.full_name, gender: s.gender, status: a?.status || null };
    });

    res.json({ success: true, data: { schedule: ss[0], attendance_date: date, session_id: sessionId, students: result } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

router.post('/record', validate(recordAttendanceSchema), async (req, res) => {
  try {
    const { schedule_id, attendance_date, records } = req.body;

    const [ss] = await pool.execute('SELECT * FROM subject_schedules WHERE id = ?', [schedule_id]);
    if (!ss.length) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });

    // Dapatkan/ buat session (hour = 1 default)
    const [exists] = await pool.execute(
      `SELECT id FROM attendance_sessions WHERE schedule_id = ? AND session_date = ? AND session_hour = 1`,
      [schedule_id, attendance_date]
    );
    let sessionId = exists[0]?.id;
    if (!sessionId) {
      const [studentsCount] = await pool.execute(
        `SELECT COUNT(*) AS total FROM student_enrollments WHERE class_id = ?`,
        [ss[0].class_id]
      );
      const [ins] = await pool.execute(
        `INSERT INTO attendance_sessions (schedule_id, session_date, session_hour, teacher_id, session_status, start_time, total_students)
         VALUES (?, ?, 1, ?, 'berlangsung', NOW(), ?)`,
        [schedule_id, attendance_date, ss[0].teacher_id, studentsCount[0]?.total || 0]
      );
      sessionId = ins.insertId;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute('DELETE FROM student_attendances WHERE session_id = ?', [sessionId]);
      for (const r of records) {
        if (!['Hadir','Sakit','Izin','Alpa','Terlambat'].includes(r.status)) throw new Error('Status tidak valid');
        await conn.execute(
          `INSERT INTO student_attendances (session_id, student_id, status, recorded_by_teacher_id) VALUES (?, ?, ?, ?)`,
          [sessionId, r.student_id, r.status, ss[0].teacher_id]
        );
      }
      await conn.commit();
      res.json({ success: true, message: 'Absensi disimpan', data: { session_id: sessionId, total_records: records.length } });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message || 'Kesalahan server' });
  }
});

module.exports = router;

const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);
router.use(requireRole(['admin', 'guru', 'wali_kelas']));

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private (admin, guru, wali_kelas)
 */
router.get('/stats', async (req, res) => {
  try {
    // Get active school year
    const [schoolYearRows] = await pool.execute(
      'SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1'
    );
    
    if (!schoolYearRows.length) {
      return res.status(404).json({ success: false, message: 'Tahun ajaran aktif tidak ditemukan' });
    }
    
    const schoolYearId = schoolYearRows[0].id;
    
    // Get total active students
    const [studentCountRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM students s JOIN student_enrollments se ON s.id = se.student_id WHERE s.is_active = TRUE AND se.school_year_id = ?',
      [schoolYearId]
    );
    
    // Get total active classes
    const [classCountRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM classes WHERE is_active = TRUE'
    );
    
    // Get today's attendance percentage
    const today = new Date().toISOString().split('T')[0];
    const [attendanceRows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_records,
        SUM(CASE WHEN sa.status = 'Hadir' THEN 1 ELSE 0 END) AS total_hadir
       FROM student_attendances sa
       JOIN attendance_sessions ats ON sa.session_id = ats.id
       WHERE ats.session_date = ?`,
      [today]
    );
    
    // Get today's sessions count
    const [sessionRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM attendance_sessions WHERE session_date = ?`,
      [today]
    );
    
    // Calculate attendance percentage
    let attendancePercentage = 0;
    if (attendanceRows[0].total_records > 0) {
      attendancePercentage = Math.round((attendanceRows[0].total_hadir / attendanceRows[0].total_records) * 100);
    }
    
    // Get today's schedule; day_of_week stored in Indonesian (Senin, Selasa, ...)
    const indonesianDayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const dayName = indonesianDayNames[new Date().getDay()];
    const [scheduleRows] = await pool.execute(
      `SELECT 
        ss.id AS schedule_id,
        c.class_name,
        sub.subject_name,
        ss.start_time,
        ss.end_time,
        t.full_name AS teacher_name,
        CASE 
          WHEN EXISTS (SELECT 1 FROM attendance_sessions ats WHERE ats.schedule_id = ss.id AND ats.session_date = ?) THEN 'filled'
          ELSE 'pending'
        END AS status
       FROM subject_schedules ss
       JOIN classes c ON ss.class_id = c.id
       JOIN subjects sub ON ss.subject_id = sub.id
       JOIN teachers t ON ss.teacher_id = t.id
       WHERE ss.day_of_week = ? AND c.is_active = TRUE
       ORDER BY ss.start_time ASC
       LIMIT 5`,
      [today, dayName]
    );
    
    res.json({
      success: true,
      data: {
        totalStudents: studentCountRows[0].total,
        totalClasses: classCountRows[0].total,
        attendancePercentage,
        totalSessions: sessionRows[0].total,
        todaySchedule: scheduleRows
      },
      request_id: req.id,
    });
  } catch (e) {
    console.error('Dashboard stats error:', e);
    res.status(500).json({ success: false, message: 'Kesalahan server', request_id: req.id });
  }
});

module.exports = router;
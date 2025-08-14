const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getOrDeleteClassSchema } = require('../validators/classes');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.class_name, c.grade_level, c.major, c.class_number,
              t.full_name AS homeroom_teacher_name
       FROM classes c
       LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
       WHERE c.is_active = TRUE
       ORDER BY c.class_name`);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

router.get('/:id', validate(getOrDeleteClassSchema), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, t.full_name AS homeroom_teacher_name
       FROM classes c LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
       WHERE c.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

router.get('/:id/students', validate(getOrDeleteClassSchema), async (req, res) => {
  try {
    const [sy] = await pool.execute('SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1');
    if (!sy.length) return res.status(400).json({ success: false, message: 'Tahun ajaran aktif tidak ditemukan' });
    const schoolYearId = sy[0].id;
    const [rows] = await pool.execute(
      `SELECT s.id, s.nis, s.nisn, s.full_name, s.gender
       FROM student_enrollments se
       JOIN students s ON s.id = se.student_id
       WHERE se.class_id = ? AND se.school_year_id = ? AND se.status = 'aktif'
       ORDER BY s.full_name`, [req.params.id, schoolYearId]);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

module.exports = router;

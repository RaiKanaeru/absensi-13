const express = require('express');
const ExcelJS = require('exceljs');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getReportSchema, exportReportSchema } = require('../validators/reports');

const router = express.Router();
router.use(authenticateToken);
router.use(requireRole(['admin','guru','wali_kelas']));

router.get('/class/:classId', validate(getReportSchema), async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    const [cls] = await pool.execute(
      `SELECT c.*, t.full_name AS homeroom_teacher_name FROM classes c
       LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id WHERE c.id = ?`,
      [classId]
    );
    if (!cls.length) return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });

    const [sy] = await pool.execute('SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1');
    const schoolYearId = sy[0]?.id;

    // daftar siswa aktif kelas
    const [students] = await pool.execute(
      `SELECT s.id, s.nis, s.full_name, s.gender
       FROM student_enrollments se JOIN students s ON s.id = se.student_id
       WHERE se.class_id = ? AND se.school_year_id = ? AND se.status = 'aktif'
       ORDER BY s.full_name`, [classId, schoolYearId]
    );

    const [records] = await pool.execute(
      `SELECT sa.student_id, sa.status
       FROM student_attendances sa
       JOIN attendance_sessions ats ON ats.id = sa.session_id
       JOIN subject_schedules ss ON ss.id = ats.schedule_id
       WHERE ss.class_id = ? AND MONTH(ats.session_date) = ? AND YEAR(ats.session_date) = ?`,
      [classId, month, year]
    );

    const data = students.map(s => {
      const att = records.filter(r => r.student_id === s.id);
      const sakit = att.filter(a => a.status === 'Sakit').length;
      const izin = att.filter(a => a.status === 'Izin').length;
      const alpa = att.filter(a => a.status === 'Alpa').length;
      const terlambat = att.filter(a => a.status === 'Terlambat').length;
      const total = att.length;
      const hadir = att.filter(a => a.status === 'Hadir').length;
      return {
        id: s.id, nis: s.nis, full_name: s.full_name, gender: s.gender,
        sakit, izin, alpa, terlambat,
        persentase_tidak_hadir: total ? (((sakit+izin+alpa+terlambat)/total)*100).toFixed(2) : '0.00',
        persentase_hadir: total ? ((hadir/total)*100).toFixed(2) : '0.00'
      };
    });

    res.json({ success: true, data: { class: cls[0], month: Number(month), year: Number(year), students: data } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

router.get('/export', validate(exportReportSchema), async (req, res) => {
  try {
    const { classId, month, year } = req.query;

    const [cls] = await pool.execute(
      `SELECT c.*, t.full_name AS homeroom_teacher_name FROM classes c
       LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id WHERE c.id = ?`,
      [classId]
    );
    if (!cls.length) return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });

    const [sy] = await pool.execute('SELECT id FROM school_years WHERE is_active = TRUE LIMIT 1');
    const schoolYearId = sy[0]?.id;

    const [students] = await pool.execute(
      `SELECT s.id, s.nis, s.full_name, s.gender
       FROM student_enrollments se JOIN students s ON s.id = se.student_id
       WHERE se.class_id = ? AND se.school_year_id = ? AND se.status = 'aktif'
       ORDER BY s.full_name`, [classId, schoolYearId]
    );

    const [records] = await pool.execute(
      `SELECT sa.student_id, sa.status
       FROM student_attendances sa
       JOIN attendance_sessions ats ON ats.id = sa.session_id
       JOIN subject_schedules ss ON ss.id = ats.schedule_id
       WHERE ss.class_id = ? AND MONTH(ats.session_date) = ? AND YEAR(ats.session_date) = ?`,
      [classId, month, year]
    );

    const rows = students.map((s, i) => {
      const att = records.filter(r => r.student_id === s.id);
      const sakit = att.filter(a => a.status === 'Sakit').length;
      const izin = att.filter(a => a.status === 'Izin').length;
      const alpa = att.filter(a => a.status === 'Alpa').length;
      const terlambat = att.filter(a => a.status === 'Terlambat').length;
      const total = att.length;
      const hadir = att.filter(a => a.status === 'Hadir').length;
      return {
        no: i+1, nis: s.nis, nama: s.full_name, gender: s.gender,
        sakit, izin, alpa, terlambat,
        tidak_hadir_pct: total ? (((sakit+izin+alpa+terlambat)/total)*100).toFixed(2) : '0.00',
        hadir_pct: total ? ((hadir/total)*100).toFixed(2) : '0.00'
      };
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Rekap Bulanan');
    ws.mergeCells('A1:K1'); ws.getCell('A1').value = 'REKAP KETIDAKHADIRAN PESERTA DIDIK'; ws.getCell('A1').font = { bold: true, size: 14 }; ws.getCell('A1').alignment={horizontal:'center'};
    ws.mergeCells('A2:K2'); ws.getCell('A2').value = `KELAS: ${cls[0].class_name}`; ws.getCell('A2').alignment={horizontal:'center'};
    ws.mergeCells('A3:K3'); ws.getCell('A3').value = `WALI KELAS: ${cls[0].homeroom_teacher_name || '-'}`; ws.getCell('A3').alignment={horizontal:'center'};
    ws.mergeCells('A4:K4'); ws.getCell('A4').value = `PERIODE: ${month}/${year}`; ws.getCell('A4').alignment={horizontal:'center'};

    const headers = ['NO.','NIS/NISN','NAMA PESERTA DIDIK','L/P','S','I','A','T','TIDAK HADIR (%)','HADIR (%)'];
    ws.addRow(headers);
    ws.getRow(5).eachCell((c)=>{ c.font={bold:true}; c.alignment={horizontal:'center'}; });

    rows.forEach(r=>{
      ws.addRow([r.no, r.nis, r.nama, r.gender, r.sakit, r.izin, r.alpa, r.terlambat, r.tidak_hadir_pct, r.hadir_pct]);
    });

    ws.columns=[{width:6},{width:14},{width:30},{width:6},{width:6},{width:6},{width:6},{width:6},{width:18},{width:14}];

    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rekap_kelas_${classId}_${month}_${year}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

module.exports = router;

const express = require('express');
const ExcelJS = require('exceljs');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware untuk semua route
router.use(authenticateToken);
router.use(requireRole(['teacher', 'admin']));

// GET laporan rekapitulasi absensi
router.get('/class/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Parameter bulan dan tahun diperlukan'
            });
        }

        // Ambil data kelas dan wali kelas
        const [classes] = await pool.execute(
            `SELECT c.*, t.full_name as homeroom_teacher_name 
             FROM classes c 
             LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id 
             WHERE c.id = ?`,
            [classId]
        );

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        const classData = classes[0];

        // Ambil daftar siswa di kelas
        const [students] = await pool.execute(
            'SELECT id, nis, full_name, gender FROM students WHERE class_id = ? ORDER BY full_name',
            [classId]
        );

        // Ambil data absensi untuk bulan dan tahun tertentu
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const [attendanceRecords] = await pool.execute(
            `SELECT ar.student_id, ar.status, ar.attendance_date
             FROM attendance_records ar
             JOIN schedules s ON ar.schedule_id = s.id
             WHERE s.class_id = ? AND ar.attendance_date BETWEEN ? AND ?
             ORDER BY ar.student_id, ar.attendance_date`,
            [classId, startDate, endDate]
        );

        // Proses data untuk laporan
        const reportData = students.map(student => {
            const studentAttendance = attendanceRecords.filter(record => record.student_id === student.id);
            
            const sakit = studentAttendance.filter(record => record.status === 'Sakit').length;
            const izin = studentAttendance.filter(record => record.status === 'Izin').length;
            const alpa = studentAttendance.filter(record => record.status === 'Alpa').length;
            const dispen = studentAttendance.filter(record => record.status === 'Dispen').length;
            
            const totalTidakHadir = sakit + izin + alpa + dispen;
            const totalHadir = studentAttendance.filter(record => record.status === 'Hadir').length;
            const totalPertemuan = studentAttendance.length;
            
            const persentaseTidakHadir = totalPertemuan > 0 ? ((totalTidakHadir / totalPertemuan) * 100).toFixed(2) : '0.00';
            const persentaseHadir = totalPertemuan > 0 ? ((totalHadir / totalPertemuan) * 100).toFixed(2) : '0.00';

            return {
                id: student.id,
                nis: student.nis,
                full_name: student.full_name,
                gender: student.gender,
                sakit,
                izin,
                alpa,
                dispen,
                total_sakit: sakit,
                total_izin: izin,
                total_alpa: alpa,
                total_tidak_hadir: totalTidakHadir,
                total_hadir: totalHadir,
                total_pertemuan: totalPertemuan,
                persentase_tidak_hadir: persentaseTidakHadir,
                persentase_hadir: persentaseHadir
            };
        });

        res.json({
            success: true,
            data: {
                class: classData,
                month: parseInt(month),
                year: parseInt(year),
                students: reportData
            }
        });

    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// GET ekspor laporan ke Excel
router.get('/export', async (req, res) => {
    try {
        const { classId, month, year } = req.query;

        if (!classId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Parameter classId, month, dan year diperlukan'
            });
        }

        // Ambil data kelas
        const [classes] = await pool.execute(
            `SELECT c.*, t.full_name as homeroom_teacher_name 
             FROM classes c 
             LEFT JOIN teachers t ON c.homeroom_teacher_id = t.id 
             WHERE c.id = ?`,
            [classId]
        );

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        const classData = classes[0];

        // Ambil data laporan
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const [students] = await pool.execute(
            'SELECT id, nis, full_name, gender FROM students WHERE class_id = ? ORDER BY full_name',
            [classId]
        );

        const [attendanceRecords] = await pool.execute(
            `SELECT ar.student_id, ar.status, ar.attendance_date
             FROM attendance_records ar
             JOIN schedules s ON ar.schedule_id = s.id
             WHERE s.class_id = ? AND ar.attendance_date BETWEEN ? AND ?
             ORDER BY ar.student_id, ar.attendance_date`,
            [classId, startDate, endDate]
        );

        // Proses data untuk laporan
        const reportData = students.map((student, index) => {
            const studentAttendance = attendanceRecords.filter(record => record.student_id === student.id);
            
            const sakit = studentAttendance.filter(record => record.status === 'Sakit').length;
            const izin = studentAttendance.filter(record => record.status === 'Izin').length;
            const alpa = studentAttendance.filter(record => record.status === 'Alpa').length;
            const dispen = studentAttendance.filter(record => record.status === 'Dispen').length;
            
            const totalTidakHadir = sakit + izin + alpa + dispen;
            const totalHadir = studentAttendance.filter(record => record.status === 'Hadir').length;
            const totalPertemuan = studentAttendance.length;
            
            const persentaseTidakHadir = totalPertemuan > 0 ? ((totalTidakHadir / totalPertemuan) * 100).toFixed(2) : '0.00';
            const persentaseHadir = totalPertemuan > 0 ? ((totalHadir / totalPertemuan) * 100).toFixed(2) : '0.00';

            return {
                no: index + 1,
                nis: student.nis,
                full_name: student.full_name,
                gender: student.gender,
                sakit,
                izin,
                alpa,
                dispen,
                total_sakit: sakit,
                total_izin: izin,
                total_alpa: alpa,
                total_tidak_hadir: totalTidakHadir,
                persentase_tidak_hadir: persentaseTidakHadir,
                persentase_hadir: persentaseHadir
            };
        });

        // Buat workbook Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rekap Ketidakhadiran');

        // Set header
        worksheet.mergeCells('A1:K1');
        worksheet.getCell('A1').value = 'REKAP KETIDAKHADIRAN PESERTA DIDIK';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:K2');
        worksheet.getCell('A2').value = 'NAMA SEKOLAH: SMA NEGERI 1 CONTOH';
        worksheet.getCell('A2').font = { bold: true };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:K3');
        worksheet.getCell('A3').value = `TAHUN AJARAN: ${year}/${parseInt(year) + 1}`;
        worksheet.getCell('A3').font = { bold: true };
        worksheet.getCell('A3').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A4:K4');
        worksheet.getCell('A4').value = `KELAS: ${classData.class_name}`;
        worksheet.getCell('A4').font = { bold: true };
        worksheet.getCell('A4').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A5:K5');
        worksheet.getCell('A5').value = `NAMA WALI KELAS: ${classData.homeroom_teacher_name || '-'}`;
        worksheet.getCell('A5').font = { bold: true };
        worksheet.getCell('A5').alignment = { horizontal: 'center' };

        // Header tabel
        const headers = [
            'NO.', 'NIS/NISN', 'NAMA PESERTA DIDIK', 'L/P', 
            'S', 'I', 'A', 'D', 'JUMLAH TOTAL S', 'JUMLAH TOTAL I', 'JUMLAH TOTAL A',
            'JUMLAH TIDAK HADIR (%)', 'JUMLAH PROSENTASE HADIR (%)'
        ];

        headers.forEach((header, index) => {
            const cell = worksheet.getCell(7, index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Data siswa
        reportData.forEach((student, index) => {
            const row = index + 8;
            const data = [
                student.no,
                student.nis,
                student.full_name,
                student.gender,
                student.sakit,
                student.izin,
                student.alpa,
                student.dispen,
                student.total_sakit,
                student.total_izin,
                student.total_alpa,
                student.persentase_tidak_hadir,
                student.persentase_hadir
            ];

            data.forEach((value, colIndex) => {
                const cell = worksheet.getCell(row, colIndex + 1);
                cell.value = value;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Set column widths
        worksheet.getColumn(1).width = 5;
        worksheet.getColumn(2).width = 15;
        worksheet.getColumn(3).width = 30;
        worksheet.getColumn(4).width = 8;
        worksheet.getColumn(5).width = 8;
        worksheet.getColumn(6).width = 8;
        worksheet.getColumn(7).width = 8;
        worksheet.getColumn(8).width = 8;
        worksheet.getColumn(9).width = 15;
        worksheet.getColumn(10).width = 15;
        worksheet.getColumn(11).width = 15;
        worksheet.getColumn(12).width = 20;
        worksheet.getColumn(13).width = 20;

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="rekap_absensi_${classData.class_name}_${month}_${year}.xlsx"`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;

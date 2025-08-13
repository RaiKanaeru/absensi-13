const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware untuk semua route
router.use(authenticateToken);

// GET semua siswa
router.get('/', async (req, res) => {
    try {
        const { class_id, search } = req.query;
        let query = `
            SELECT s.*, c.class_name 
            FROM students s 
            JOIN classes c ON s.class_id = c.id
        `;
        let params = [];

        if (class_id) {
            query += ' WHERE s.class_id = ?';
            params.push(class_id);
        }

        if (search) {
            const searchCondition = class_id ? ' AND' : ' WHERE';
            query += `${searchCondition} (s.full_name LIKE ? OR s.nis LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.full_name';

        const [students] = await pool.execute(query, params);

        res.json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// GET siswa berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await pool.execute(
            `SELECT s.*, c.class_name 
             FROM students s 
             JOIN classes c ON s.class_id = c.id 
             WHERE s.id = ?`,
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: students[0]
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// POST siswa baru
router.post('/', requireRole(['admin']), async (req, res) => {
    try {
        const { nis, full_name, gender, class_id } = req.body;

        if (!nis || !full_name || !gender || !class_id) {
            return res.status(400).json({
                success: false,
                message: 'Semua field diperlukan'
            });
        }

        // Validasi gender
        if (!['L', 'P'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: 'Gender harus L atau P'
            });
        }

        // Cek apakah NIS sudah ada
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE nis = ?',
            [nis]
        );

        if (existingStudents.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'NIS sudah terdaftar'
            });
        }

        // Cek apakah kelas ada
        const [classes] = await pool.execute(
            'SELECT id FROM classes WHERE id = ?',
            [class_id]
        );

        if (classes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO students (nis, full_name, gender, class_id) VALUES (?, ?, ?, ?)',
            [nis, full_name, gender, class_id]
        );

        const [newStudent] = await pool.execute(
            `SELECT s.*, c.class_name 
             FROM students s 
             JOIN classes c ON s.class_id = c.id 
             WHERE s.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Siswa berhasil ditambahkan',
            data: newStudent[0]
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// PUT update siswa
router.put('/:id', requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { nis, full_name, gender, class_id } = req.body;

        if (!nis || !full_name || !gender || !class_id) {
            return res.status(400).json({
                success: false,
                message: 'Semua field diperlukan'
            });
        }

        // Validasi gender
        if (!['L', 'P'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: 'Gender harus L atau P'
            });
        }

        // Cek apakah siswa ada
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [id]
        );

        if (existingStudents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        // Cek apakah NIS sudah ada (kecuali siswa yang sedang diupdate)
        const [duplicateNIS] = await pool.execute(
            'SELECT id FROM students WHERE nis = ? AND id != ?',
            [nis, id]
        );

        if (duplicateNIS.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'NIS sudah terdaftar'
            });
        }

        // Cek apakah kelas ada
        const [classes] = await pool.execute(
            'SELECT id FROM classes WHERE id = ?',
            [class_id]
        );

        if (classes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Kelas tidak ditemukan'
            });
        }

        await pool.execute(
            'UPDATE students SET nis = ?, full_name = ?, gender = ?, class_id = ? WHERE id = ?',
            [nis, full_name, gender, class_id, id]
        );

        const [updatedStudent] = await pool.execute(
            `SELECT s.*, c.class_name 
             FROM students s 
             JOIN classes c ON s.class_id = c.id 
             WHERE s.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Siswa berhasil diupdate',
            data: updatedStudent[0]
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// DELETE siswa
router.delete('/:id', requireRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah siswa ada
        const [existingStudents] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [id]
        );

        if (existingStudents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        await pool.execute('DELETE FROM students WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Siswa berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;


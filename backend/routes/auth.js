const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password diperlukan'
            });
        }

        // Cari user berdasarkan username
        const [users] = await pool.execute(
            'SELECT id, username, password_hash, role FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const user = users[0];

        // Verifikasi password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Ambil data tambahan berdasarkan role
        let additionalData = {};
        if (user.role === 'teacher') {
            const [teachers] = await pool.execute(
                'SELECT id, nip, full_name FROM teachers WHERE user_id = ?',
                [user.id]
            );
            if (teachers.length > 0) {
                additionalData = teachers[0];
            }
        }

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    ...additionalData
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = users[0];
        let additionalData = {};

        if (user.role === 'teacher') {
            const [teachers] = await pool.execute(
                'SELECT id, nip, full_name FROM teachers WHERE user_id = ?',
                [user.id]
            );
            if (teachers.length > 0) {
                additionalData = teachers[0];
            }
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                ...additionalData
            }
        });

    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

module.exports = router;


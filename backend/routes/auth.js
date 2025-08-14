const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/auth');

const router = express.Router();

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.execute('SELECT id, username, password_hash, salt, role FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Kredensial salah' });
    const user = rows[0];

    // Verifikasi hash:
    // - Jika password_hash adalah bcrypt ($2*), gunakan bcrypt.compare
    // - Jika tidak, dan ada salt, fallback ke legacy sha256(salt + password)
    let ok = false;
    if (typeof user.password_hash === 'string' && user.password_hash.startsWith('$2')) {
      ok = await bcrypt.compare(password, user.password_hash).catch(() => false);
    } else if (user.salt) {
      const legacy = crypto.createHash('sha256').update(String(user.salt) + String(password)).digest('hex');
      ok = legacy === user.password_hash;
    }
    if (!ok) return res.status(401).json({ success: false, message: 'Kredensial salah' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

    // Jika role guru, ambil profil guru
    let teacher = null;
    if (user.role === 'teacher' || user.role === 'guru') {
      const [t] = await pool.execute('SELECT id, nip, full_name FROM teachers WHERE user_id = ?', [user.id]);
      teacher = t[0] || null;
    }

    res.json({ success: true, data: { token, user: { id: user.id, username: user.username, role: user.role, ...(teacher || {}) } } });
  } catch (e) {
    console.error('Auth login error:', e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, role FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    const user = rows[0];
    let teacher = null;
    if (user.role === 'teacher' || user.role === 'guru') {
      const [t] = await pool.execute('SELECT id, nip, full_name FROM teachers WHERE user_id = ?', [user.id]);
      teacher = t[0] || null;
    }
    res.json({ success: true, data: { ...user, ...(teacher || {}) } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

module.exports = router;

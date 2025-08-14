const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
} = require('../validators/users');

const router = express.Router();
router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/users - list users (admin only)
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, role FROM users ORDER BY username');
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

// POST /api/users - create user (admin only)
router.post('/', validate(createUserSchema), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, '', role]
    );
    
    res.status(201).json({ success: true, data: { id: result.insertId, username, role } });
  } catch (e) {
    console.error(e);
    if (e.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Username sudah ada' });
    } else {
      res.status(500).json({ success: false, message: 'Kesalahan server' });
    }
  }
});

// PUT /api/users/:id - update user (admin only)
router.put('/:id', validate(updateUserSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    let query = 'UPDATE users SET username = ?, role = ?';
    let params = [username, role];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    res.json({ success: true, data: { id, username, role } });
  } catch (e) {
    console.error(e);
    if (e.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Username sudah ada' });
    } else {
      res.status(500).json({ success: false, message: 'Kesalahan server' });
    }
  }
});

// DELETE /api/users/:id - delete user (admin only)
router.delete('/:id', validate(deleteUserSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Kesalahan server' });
  }
});

module.exports = router;




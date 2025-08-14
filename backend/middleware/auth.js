const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token diperlukan' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT id, username, role FROM users WHERE id = ?', [decoded.userId]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Token tidak valid' });
    req.user = rows[0];
    next();
  } catch (e) {
    return res.status(403).json({ success: false, message: 'Token tidak valid/expired' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Autentikasi diperlukan' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Akses ditolak' });
    next();
  };
}

module.exports = { authenticateToken, requireRole };

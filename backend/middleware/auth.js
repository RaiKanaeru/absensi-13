const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token akses diperlukan' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ambil data user dari database
        const [users] = await pool.execute(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token tidak valid' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token tidak valid atau expired' 
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak' 
            });
        }

        next();
    };
};

module.exports = { authenticateToken, requireRole };


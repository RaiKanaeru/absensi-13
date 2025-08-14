const request = require('supertest');
const express = require('express');
const dashboardRouter = require('../routes/dashboard');
const errorHandler = require('../middleware/error');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn((sql) => {
      if (/FROM school_years WHERE is_active/i.test(sql)) return Promise.resolve([[{ id:1 }], null]);
      if (/FROM students s JOIN student_enrollments/i.test(sql)) return Promise.resolve([[{ total: 100 }], null]);
      if (/FROM classes WHERE is_active = TRUE/i.test(sql)) return Promise.resolve([[{ total: 10 }], null]);
      if (/FROM student_attendances sa/i.test(sql)) return Promise.resolve([[{ total_records:0, total_hadir:0 }], null]);
      if (/FROM attendance_sessions WHERE session_date/i.test(sql)) return Promise.resolve([[{ total:0 }], null]);
      if (/FROM subject_schedules ss/i.test(sql)) return Promise.resolve([[ ], null]);
      return Promise.resolve([[ ], null]);
    }),
  },
}));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId, role: decoded.role };
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
});
app.use('/dashboard', dashboardRouter);
app.use(errorHandler);

describe('Dashboard Routes', () => {
  test('GET /dashboard/stats - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app).get('/dashboard/stats').set('Authorization', `Bearer ${token}`);
    expect(res.body).toHaveProperty('success', true);
  });
});

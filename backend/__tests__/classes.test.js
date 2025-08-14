const request = require('supertest');
const express = require('express');
const classesRouter = require('../routes/classes');
const errorHandler = require('../middleware/error');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn((sql) => {
      if (/FROM classes c/i.test(sql) && /ORDER BY c.class_name/i.test(sql)) {
        return Promise.resolve([[{ id:1, class_name:'X A', grade_level:'X', major:'RPL', class_number:1, homeroom_teacher_name: null }], null]);
      }
      if (/FROM classes c LEFT JOIN teachers/i.test(sql) && /WHERE c.id = \?/i.test(sql)) {
        return Promise.resolve([[/* empty for not found test */], null]);
      }
      return Promise.resolve([[ ], null]);
    }),
  },
}));

const { pool } = require('../config/database');

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
app.use('/classes', classesRouter);
app.use(errorHandler);

describe('Classes Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /classes - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app).get('/classes').set('Authorization', `Bearer ${token}`);
    expect(res.body).toHaveProperty('success', true);
  });

  test('GET /classes/:id - with token not found', async () => {
    pool.execute.mockResolvedValueOnce([[], null]);
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app).get('/classes/999').set('Authorization', `Bearer ${token}`);
    expect(res.body.success).toBe(false);
  });
});

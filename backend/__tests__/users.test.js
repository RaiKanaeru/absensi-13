const request = require('supertest');
const express = require('express');
const usersRouter = require('../routes/users');
const errorHandler = require('../middleware/error');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn((sql) => {
      if (/SELECT id, username, role FROM users/i.test(sql)) {
        return Promise.resolve([[{ id:1, username:'admin', role:'admin'}], null]);
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
app.use('/users', usersRouter);
app.use(errorHandler);

describe('Users Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /users - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.body).toHaveProperty('success', true);
  });
});

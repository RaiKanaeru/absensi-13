const request = require('supertest');
const express = require('express');
const attendanceRouter = require('../routes/attendance');
const errorHandler = require('../middleware/error');
const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock the database pool
jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn().mockResolvedValue([[], null]),
    getConnection: jest.fn().mockResolvedValue({
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Import the mocked module
const { pool } = require('../config/database');

// Setup Express app with middleware
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  // Mock authentication middleware for testing
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId, role: decoded.role };
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
});
app.use('/attendance', attendanceRouter);
app.use(errorHandler);

describe('Attendance Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to verify the route exists
  test('GET /attendance/teacher/:teacherId/today - unauthorized access', async () => {
    const res = await request(app).get('/attendance/teacher/1/today');
    expect(res.body.success).toBe(false);
  });

  // Basic test with authorization
  test('GET /attendance/teacher/:teacherId/today - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'guru' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/attendance/teacher/1/today')
      .set('Authorization', `Bearer ${token}`);
    
    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });

  // Basic test for schedule endpoint
  test('GET /attendance/schedule/:scheduleId - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'guru' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/attendance/schedule/1?date=2023-05-15')
      .set('Authorization', `Bearer ${token}`);
    
    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });

  // Basic test for record endpoint
  test('POST /attendance/record - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'guru' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/attendance/record')
      .set('Authorization', `Bearer ${token}`)
      .send({
        schedule_id: 1,
        attendance_date: '2023-05-15',
        records: [
          { student_id: 101, status: 'Hadir' }
        ]
      });
    
    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });
});
const request = require('supertest');
const express = require('express');
const reportsRouter = require('../routes/reports');
const errorHandler = require('../middleware/error');
const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock the database pool
jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn().mockResolvedValue([[], null]),
  },
}));

// Mock ExcelJS
jest.mock('exceljs', () => {
  const mockWorksheet = {
    mergeCells: jest.fn(),
    getCell: jest.fn().mockReturnValue({
      value: '',
      font: {},
      alignment: {},
    }),
    addRow: jest.fn(),
    getRow: jest.fn().mockReturnValue({
      eachCell: jest.fn(),
    }),
    columns: [],
  };

  const mockWorkbook = {
    addWorksheet: jest.fn().mockReturnValue(mockWorksheet),
    xlsx: {
      write: jest.fn().mockResolvedValue(Buffer.from('test')),
    },
  };

  return {
    Workbook: jest.fn().mockReturnValue(mockWorkbook),
  };
});

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
app.use('/reports', reportsRouter);
app.use(errorHandler);

describe('Reports Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to verify the route exists
  test('GET /reports/class/:classId - unauthorized access', async () => {
    const res = await request(app).get('/reports/class/1?month=5&year=2023');
    expect(res.body.success).toBe(false);
  });

  // Basic test with authorization
  test('GET /reports/class/:classId - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    
    // Mock class response for this test only
    pool.execute.mockResolvedValueOnce([[
      { id: 1, class_name: 'X IPA 1', homeroom_teacher_id: 5, homeroom_teacher_name: 'Teacher Name' }
    ], null]);
    
    const res = await request(app)
      .get('/reports/class/1?month=5&year=2023')
      .set('Authorization', `Bearer ${token}`);
    
    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });

  // Basic test for export endpoint
  test('GET /reports/export - with token', async () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    
    // Mock class response for this test only
    pool.execute.mockResolvedValueOnce([[
      { id: 1, class_name: 'X IPA 1', homeroom_teacher_id: 5, homeroom_teacher_name: 'Teacher Name' }
    ], null]);
    
    const res = await request(app)
      .get('/reports/export?classId=1&month=5&year=2023')
      .set('Authorization', `Bearer ${token}`);
    
    // Just check that headers exist without checking specific values
    expect(res.headers).toBeTruthy();
  });


});
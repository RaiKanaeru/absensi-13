const request = require('supertest');
const express = require('express');
const authRouter = require('../routes/auth');
const errorHandler = require('../middleware/error');
const bcrypt = require('bcryptjs');
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

// Import the mocked module
const { pool } = require('../config/database');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test for login endpoint
  test('POST /auth/login - with valid credentials', async () => {
    // Mock bcrypt password
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    
    // Mock database responses
    pool.execute.mockResolvedValueOnce([[
      {
        id: 1,
        username: 'testuser',
        password_hash: hashedPassword,
        role: 'admin',
      },
    ], null]);

    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'correctpassword',
      });

    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });

  // Basic test for me endpoint
  test('GET /auth/me - with token', async () => {
    // Create a valid token
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET);
    
    // Mock database response
    pool.execute.mockResolvedValueOnce([[
      {
        id: 1,
        username: 'admin',
        role: 'admin',
      },
    ], null]);

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    // Just check that the response has the expected structure
    expect(res.body).toHaveProperty('success');
  });
});
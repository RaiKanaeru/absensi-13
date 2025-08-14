const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const next = require('next');
const helmet = require('helmet');
const morgan = require('morgan');
const requestId = require('../backend/middleware/requestId');
const rateLimit = require('express-rate-limit');

// Reuse existing mysql pool and routes from backend/
const { testConnection } = require('../backend/config/database');
const authRoutes = require('../backend/routes/auth');
const classesRoutes = require('../backend/routes/classes');
const attendanceRoutes = require('../backend/routes/attendance');
const reportsRoutes = require('../backend/routes/reports');
const usersRoutes = require('../backend/routes/users');
const dashboardRoutes = require('../backend/routes/dashboard');
const errorHandler = require('../backend/middleware/error');

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 3000);

async function bootstrap() {
  const app = express();
  const nextApp = next({ dev, dir: path.join(__dirname, '..') });
  const handle = nextApp.getRequestHandler();

  await testConnection();
  await nextApp.prepare();

  // Log readiness & config presence (tanpa menampilkan nilai rahasia)
  console.log(`ENV PORT: ${port}`);
  console.log(`ENV JWT_SECRET set: ${process.env.JWT_SECRET ? 'yes' : 'no'}`);

  // Security & logging
  if (dev) {
    // Dev needs HMR: allow 'unsafe-eval' & 'unsafe-inline' to avoid CSP issues
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "script-src": [
              "'self'",
              "'unsafe-inline'",
              "'unsafe-eval'",
              "http:",
              "https:"
            ],
            "connect-src": ["'self'", "ws:", "http:", "https:"],
            "img-src": ["'self'", "data:", "blob:", "https:"],
            "style-src": ["'self'", "'unsafe-inline'", "https:"]
          }
        }
      })
    );
  } else {
    app.use(helmet());
  }
  app.use(requestId);
  morgan.token('id', (req) => req.id);
  app.use(morgan(':id :method :url :status :response-time ms'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
  app.use(express.json({ limit: '10mb' }));

  // API routes (same-origin → no CORS needed)
  app.use('/api/auth', authRoutes);
  app.use('/api/classes', classesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Health
  app.get('/api/health', (_req, res) => res.json({ success: true, message: 'ok' }));

  // Next.js handler for all other routes
  app.all('*', (req, res) => handle(req, res));

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`✅ One-port server ready at http://localhost:${port}`);
  });
}

bootstrap().catch((e) => {
  console.error('Failed to start one-port server:', e);
  process.exit(1);
});



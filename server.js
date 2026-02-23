require('dotenv').config(); // Load environment variables from .env file

// Set Global Timezone
if (process.env.TZ) {
  process.env.TZ = process.env.TZ;
}

const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');

const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const { initializeSocket } = require('./src/utils/socket');
const errorHandler = require('./src/middlewares/errorHandler');
const { success } = require('./src/utils/response');

// Import Routes
const profileRoutes = require('./src/routes/profile/profile');
const authRoutes = require('./src/routes/auth/auth');
const connectionRoutes = require('./src/routes/connection/connection');
const discoverRoutes = require('./src/routes/discover.routes');
const messageRoutes = require('./src/routes/message.routes');
const metaRoutes = require('./src/routes/meta.routes');
const safetyRoutes = require('./src/routes/safety.routes');
const legalRoutes = require('./src/routes/legal.routes');
const verificationRoutes = require('./src/routes/verification.routes');
const adminRoutes = require('./src/routes/admin/admin.routes');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Firebase Admin SDK:', error);
}

const { generalLimiter, authLimiter, reportLimiter } = require('./src/middlewares/rateLimiter');

const app = express();

// Trust proxy for production (e.g., behind Nginx/ALB on AWS)
// We set it to true or 1 to trust X-Forwarded-For headers
app.set('trust proxy', 1);
logger.info('Express "trust proxy" is set to 1');


// --- Production Middlewares ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://www.gstatic.com"
        ],
        frameSrc: [
          "'self'",
          "https://accounts.google.com"
        ],
        connectSrc: [
          "'self'",
          "https://accounts.google.com"
        ],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      },
    },
  })
);

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression()); // Compress responses
app.use(express.json({ limit: process.env.JSON_PAYLOAD_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_PAYLOAD_LIMIT || '10mb' }));

// Logging requests
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

// Global Rate Limiter
app.use('/api', generalLimiter);

// Connect to the database
connectDB();

// Initialize default app configuration
const { initializeDefaultConfig } = require('./src/scripts/initConfig');
initializeDefaultConfig();

// --- Use the routes ---
app.use('/api/users', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/safety', reportLimiter, safetyRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/admin', adminRoutes);

// Mount auth at both /api and / for compatibility with frontend
app.use('/api', authLimiter, authRoutes);
app.use('/', authLimiter, authRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  success(res, 'MAYA Backend is healthy!', {
    timestamp: new Date(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  success(res, 'Welcome to MAYA (Premium Dating App) API');
});

// Test POST route
app.post('/api/test-post', (req, res) => {
  logger.info(`Test POST hit. Body: ${JSON.stringify(req.body)}`);
  success(res, 'Test POST successful', { body: req.body });
});

// 404 Handler - log the request path to help debug what the frontend is calling
app.use((req, res, next) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// Creating HTTP Server
const server = http.createServer(app);
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`🚀 Server is running on http://${HOST}:${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});
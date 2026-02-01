require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const admin = require('firebase-admin');
const connectDB = require('./src/config/database');
const profileRoutes = require('./src/routes/profile/profile');
const authRoutes = require('./src/routes/auth/auth');
const connectionRoutes = require('./src/routes/connection/connection');
const discoverRoutes = require('./src/routes/discover.routes');
const messageRoutes = require('./src/routes/message.routes');
const metaRoutes = require('./src/routes/meta.routes');
const safetyRoutes = require('./src/routes/safety.routes');
const legalRoutes = require('./src/routes/legal.routes');
const verificationRoutes = require('./src/routes/verification.routes');

const errorHandler = require('./src/middlewares/errorHandler');
const { success } = require('./src/utils/response');
const http = require('http');
const { initializeSocket } = require('./src/utils/socket');


// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const { generalLimiter, authLimiter, reportLimiter } = require('./src/middlewares/rateLimiter');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set security HTTP headers
const helmet = require('helmet');
app.use(helmet());

// Global Rate Limiter
app.use('/api', generalLimiter);

// Connect to the database
connectDB();

// Use the routes
app.use('/api/users', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/safety', reportLimiter, safetyRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/verify', verificationRoutes);

app.use('/', authLimiter, authRoutes);

// Basic route for health check
app.get('/', (req, res) => {
  success(res, 'Dating App Backend is running!');
});

// Test route
app.get('/test', (req, res) => {
  success(res, 'Test successful');
});

// Global Error Handling Middleware (must be after all routes)
app.use(errorHandler);


// Cerating HTTP Server
const server = http.createServer(app);
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const admin = require('firebase-admin');
const connectDB = require('./src/config/database');
const profileRoutes = require('./src/routes/profile/profile');
const authRoutes = require('./src/routes/auth/auth');
const connectionRoutes = require('./src/routes/connection/connection');
const errorHandler = require('./middlewares/errorHandler');
const { success } = require('./utils/response');

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the database
connectDB();

// Use the routes
app.use('/api/users', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/', authRoutes);

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
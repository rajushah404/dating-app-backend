require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const admin = require('firebase-admin');
const connectDB = require('./src/config/database');
const profileRoutes = require('./src/routes/profile');
const authRoutes = require('./src/routes/auth');

// Initialize Firebase Admin SDK
// Load the service account key from the path specified in environment variables
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
app.use('/', profileRoutes);
app.use('/', authRoutes);

// Basic route for health check
app.get('/', (req, res) => {
  res.send('Dating App Backend is running!');
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
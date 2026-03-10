// backend/server.js
// This is the ENTRY POINT of the backend
// It sets up the Express server, connects to databases, and registers routes

require('dotenv').config(); // Load .env file variables into process.env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const connectMongoDB = require('./config/mongodb');
const { testConnection } = require('./config/postgres');
const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/query');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE (runs on every request)
// ==========================================

// Helmet: Adds security HTTP headers automatically
app.use(helmet());

// CORS: Allows our React frontend (on port 3000) to call this backend (on port 5000)
// Without CORS, browsers block cross-origin requests for security
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
}));

// Parse incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json({ limit: '10kb' })); // Limit body size for security
app.use(express.urlencoded({ extended: true }));

// ==========================================
// ROUTES
// ==========================================

// Health check - used to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CipherSQLStudio API is running',
    timestamp: new Date().toISOString()
  });
});

// Main API routes
app.use('/api/assignments', assignmentRoutes); // Assignment CRUD
app.use('/api/query', queryRoutes);            // Query execution + hints

// 404 handler - catches any request to routes that don't exist
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ==========================================
// START SERVER
// ==========================================
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectMongoDB();
    
    // Test PostgreSQL connection
    await testConnection();
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`\n🚀 CipherSQLStudio Backend running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

console.log("Gemini key:", process.env.GEMINI_API_KEY);

startServer();

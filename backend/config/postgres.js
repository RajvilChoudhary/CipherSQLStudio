// backend/config/postgres.js
// PostgreSQL is our SANDBOX database
// Every user gets their own isolated "schema" (like a private folder)
// so they can't see or affect each other's data

const { Pool } = require('pg');

// Pool = a collection of reusable connections (more efficient than creating new connections each time)
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'ciphersqlstudio_sandbox',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  max: 20,           // Maximum 20 connections in pool
  idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout after 2 seconds if can't connect
});

// Test the connection when server starts
pool.on('connect', () => {
  console.log('✅ PostgreSQL Pool connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Pool Error:', err);
});

// Helper function to test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL Connection Verified');
  } catch (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
  }
};

module.exports = { pool, testConnection };

// backend/routes/query.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { executeUserQuery, getHint, getProgress } = require('../controllers/queryController');

// Rate limiter for query execution: max 30 queries per minute per IP
// Prevents abuse and server overload
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Too many queries. Please wait a moment.' }
});

// Rate limiter for hints: max 10 hints per minute per IP
// Hints call LLM API which costs money
const hintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many hint requests. Please try on your own first!' }
});

// POST /api/query/execute  --> Execute a SQL query
router.post('/execute', queryLimiter, executeUserQuery);

// POST /api/query/hint  --> Get an AI hint
router.post('/hint', hintLimiter, getHint);

// GET /api/query/progress/:assignmentId  --> Get saved progress
router.get('/progress/:assignmentId', getProgress);

module.exports = router;

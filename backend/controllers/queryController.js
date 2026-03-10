// backend/controllers/queryController.js
// Handles SQL query execution and hint generation

const Assignment = require('../models/Assignment');
const UserProgress = require('../models/UserProgress');
const { executeQuery } = require('../utils/sandbox');
const { getLLMHint } = require('../utils/llmHint');

/**
 * POST /api/query/execute
 * Executes user's SQL query in sandbox and returns results
 * 
 * Request body: { assignmentId, query, sessionId }
 */
const executeUserQuery = async (req, res) => {
  const { assignmentId, query, sessionId } = req.body;

  // Validate required fields
  if (!assignmentId || !query || !sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'assignmentId, query, and sessionId are required' 
    });
  }

  if (!query.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Query cannot be empty' 
    });
  }

  // Query length limit (prevent DOS attacks with huge queries)
  if (query.length > 5000) {
    return res.status(400).json({ 
      success: false, 
      message: 'Query is too long (max 5000 characters)' 
    });
  }

  try {
    // Fetch the assignment to get its sample tables
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    // Execute query in sandbox
    // This creates a private schema, inserts data, runs query, cleans up
    const result = await executeQuery(sessionId, query, assignment.sampleTables);

    // Save progress to MongoDB (async - don't wait for it)
    saveProgress(sessionId, assignmentId, query).catch(err => 
      console.error('Progress save error:', err)
    );

    // Return results to frontend
    return res.json({
      success: result.success,
      ...(result.success ? {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields,
        executionTime: result.executionTime,
        command: result.command,
      } : {
        error: result.error
      })
    });

  } catch (error) {
    console.error('executeUserQuery error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during query execution',
      error: error.message 
    });
  }
};

/**
 * POST /api/query/hint
 * Calls LLM to get a hint (not solution) for the student
 * 
 * Request body: { assignmentId, currentQuery, errorMessage, sessionId }
 */
const getHint = async (req, res) => {
  const { assignmentId, currentQuery, errorMessage, sessionId } = req.body;

  if (!assignmentId || !sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'assignmentId and sessionId are required' 
    });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    // Get hint from LLM (engineered to NOT give the solution)
    const hint = await getLLMHint(assignment, currentQuery || '', errorMessage || '');

    res.json({ 
      success: true, 
      hint 
    });

  } catch (error) {
    console.error('getHint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate hint. Please check your LLM API key.',
      error: error.message 
    });
  }
};

/**
 * Helper: Save user's query progress to MongoDB
 */
const saveProgress = async (sessionId, assignmentId, query) => {
  try {
    // findOneAndUpdate with upsert: update if exists, create if not
    await UserProgress.findOneAndUpdate(
      { sessionId, assignmentId },
      {
        sqlQuery: query,
        lastAttempt: new Date(),
        $inc: { attemptCount: 1 }, // Increment attempt count
        $push: { 
          queryHistory: { 
            $each: [{ query, executedAt: new Date() }],
            $slice: -10 // Keep only last 10 queries
          } 
        }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/query/progress/:assignmentId?sessionId=xxx
 * Get saved progress for a session + assignment
 */
const getProgress = async (req, res) => {
  const { assignmentId } = req.params;
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  try {
    const progress = await UserProgress.findOne({ sessionId, assignmentId });
    res.json({ 
      success: true, 
      data: progress || { sqlQuery: '', attemptCount: 0, isCompleted: false }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { executeUserQuery, getHint, getProgress };

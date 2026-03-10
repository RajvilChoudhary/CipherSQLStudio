// backend/models/UserProgress.js
// Tracks what queries a user has attempted for each assignment
// Uses sessionId (no login required for basic version)

const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  // sessionId: a unique ID we give each browser session (stored in localStorage)
  // This lets us track progress without requiring a login
  sessionId: { 
    type: String, 
    required: true,
    index: true // Index makes queries on this field faster
  },
  assignmentId: { 
    type: mongoose.Schema.Types.ObjectId, // References the Assignment collection
    ref: 'Assignment',
    required: true 
  },
  // The last SQL query the user wrote for this assignment
  sqlQuery: { type: String, default: '' },
  // All queries the user has tried (limited to last 10 to save space)
  queryHistory: [{ 
    query: String, 
    executedAt: { type: Date, default: Date.now }
  }],
  isCompleted: { type: Boolean, default: false },
  attemptCount: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
}, { 
  timestamps: true 
});

// Compound index: one session can have one progress record per assignment
UserProgressSchema.index({ sessionId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);

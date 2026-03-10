// backend/models/Assignment.js
// This is the "blueprint" for how assignments are stored in MongoDB
// Mongoose is an ODM (Object Document Mapper) - it lets us work with MongoDB in a structured way

const mongoose = require('mongoose');

// Schema for column definition in a table
const ColumnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType: { 
    type: String, 
    required: true,
    enum: ['INTEGER', 'TEXT', 'REAL', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'VARCHAR', 'NUMERIC', 'BIGINT', 'FLOAT']
  }
}, { _id: false }); // _id: false means MongoDB won't auto-create an ID for each column

// Schema for a table inside an assignment
const SampleTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [ColumnSchema],
  // Rows stored as array of flexible objects (e.g., [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}])
  rows: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

// Main Assignment Schema
const AssignmentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Assignment title is required'],
    trim: true // Removes leading/trailing spaces
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  question: { 
    type: String, 
    required: [true, 'Question is required'] 
  },
  // Hint text to guide students (not the solution!)
  hints: [{ type: String }],
  sampleTables: [SampleTableSchema],
  expectedOutput: {
    type: { 
      type: String, 
      enum: ['table', 'single_value', 'column', 'count', 'row'],
      default: 'table'
    },
    value: { type: mongoose.Schema.Types.Mixed } // Can store any type of result
  },
  // Tags help categorize assignments (e.g., "SELECT", "JOIN", "GROUP BY")
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: true // Auto-adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Assignment', AssignmentSchema);

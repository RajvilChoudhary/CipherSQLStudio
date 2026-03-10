// backend/controllers/assignmentController.js
// Controllers handle the "business logic" - what happens when an API endpoint is called
// They receive the request, do work, and send a response

const Assignment = require('../models/Assignment');

/**
 * GET /api/assignments
 * Returns list of all active assignments (without full sample data - to keep response light)
 */
const getAllAssignments = async (req, res) => {
  try {
    // .select() specifies which fields to include/exclude
    // We exclude sampleTables and expectedOutput from the list view (too much data)
    const assignments = await Assignment.find({ isActive: true })
      .select('title description difficulty question tags createdAt')
      .sort({ difficulty: 1, createdAt: 1 }); // Easy first, then Medium, then Hard

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (error) {
    console.error('getAllAssignments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch assignments',
      error: error.message 
    });
  }
};

/**
 * GET /api/assignments/:id
 * Returns a single assignment with ALL details (including sample tables)
 * This is called when a user clicks on an assignment to attempt it
 */
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    if (!assignment.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment is not available' 
      });
    }

    // Return assignment but HIDE the expectedOutput.value from students!
    // We don't want them to just look at the answer
    const assignmentData = assignment.toObject();
    if (assignmentData.expectedOutput) {
      delete assignmentData.expectedOutput.value; // Remove the actual answer
    }

    res.json({
      success: true,
      data: assignmentData
    });

  } catch (error) {
    console.error('getAssignmentById error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch assignment',
      error: error.message 
    });
  }
};

module.exports = { getAllAssignments, getAssignmentById };

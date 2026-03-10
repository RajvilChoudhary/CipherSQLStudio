// backend/routes/assignments.js
// Routes define the URL paths and which controller function handles each path

const express = require('express');
const router = express.Router();
const { getAllAssignments, getAssignmentById } = require('../controllers/assignmentController');

// GET /api/assignments  --> Gets all assignments (for the listing page)
router.get('/', getAllAssignments);

// GET /api/assignments/:id  --> Gets one assignment by ID (for the attempt page)
router.get('/:id', getAssignmentById);

module.exports = router;

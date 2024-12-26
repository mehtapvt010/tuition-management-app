const express = require('express');
const router = express.Router();

// Import middlewares
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');
const { uploadSingleFile } = require('../middleware/upload.middleware');  // from step #1

// Import controllers
const {
  createAssignment,
  viewAssignments,
  submitAssignment,
  gradeSubmission
} = require('../controllers/assignment.controller');

/*
  Endpoints Overview:

  1) POST /assignments
     - Admin creates a new assignment
  2) GET /assignments
     - Admin or student can view assignments
  3) POST /assignments/:assignmentId/submit
     - Student uploads a file or text
  4) POST or PUT /assignments/:assignmentId/grade
     - Admin grades a submission
*/

// CREATE assignment (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  createAssignment
);

// VIEW assignments (any authenticated user, or separate admin vs. student logic if needed)
router.get(
  '/',
  authMiddleware,
  // if you want different roles, you can do roleMiddleware('admin') or 'student'
  viewAssignments
);

// SUBMIT assignment (Student)
router.post(
  '/:assignmentId/submit',
  authMiddleware,
  roleMiddleware('student'),
  uploadSingleFile,  // Multer for file upload
  submitAssignment
);

// GRADE submission (Admin)
router.post(
  '/:assignmentId/grade',
  authMiddleware,
  roleMiddleware('admin'),
  gradeSubmission
);

// or if you prefer PUT /assignments/:assignmentId/grade, you can do:
router.put(
  '/:assignmentId/grade',
  authMiddleware,
  roleMiddleware('admin'),
  gradeSubmission
);

module.exports = router;
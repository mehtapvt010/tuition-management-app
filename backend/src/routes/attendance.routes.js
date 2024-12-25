// src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

const {
  markAttendanceForStudent,
  getAttendance,
  getStudentAnalytics
} = require('../controllers/attendance.controller');

// POST /attendance -> mark attendance for a single student + date
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'), // if only admins can do this
  markAttendanceForStudent
);

// GET /attendance -> optional studentEmail, studentName, date
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  getAttendance
);

// GET /analytics/:studentId
router.get(
  '/analytics/:studentId',
  authMiddleware,
  roleMiddleware('admin'),
  getStudentAnalytics
);

module.exports = router;
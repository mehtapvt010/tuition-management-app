// src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/student.controller.js');

// Import auth & role middlewares
const { authMiddleware } = require('../middleware/auth.middleware.js');
const { roleMiddleware } = require('../middleware/role.middleware.js');

// We'll assume only admins can manage students
router.get('/', authMiddleware, roleMiddleware('admin'), getAllStudents);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getStudentById);
router.post('/', authMiddleware, roleMiddleware('admin'), createStudent);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteStudent);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/class.controller.js');

const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

// Admin-only as well
router.get('/', authMiddleware, roleMiddleware('admin'), getAllClasses);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getClassById);
router.post('/', authMiddleware, roleMiddleware('admin'), createClass);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateClass);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteClass);

module.exports = router;

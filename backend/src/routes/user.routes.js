const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware.js');
const { roleMiddleware } = require('../middleware/role.middleware.js');
const User = require('../models/user.model.js');

// GET /users => Admin only
router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash'); // hide passwordHash
    return res.status(200).json(users);
  } catch (error) {
    console.error('User fetch error:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
});

module.exports = router;
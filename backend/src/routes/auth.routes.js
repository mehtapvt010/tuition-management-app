const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware.js');
const User = require('../models/user.model.js');
const {registerSchema, loginSchema} = require('../validators/authValidator.js');

// ---------------------------------------
// POST /auth/register
// ---------------------------------------
router.post('/register', async (req, res) => {
  try {
    // Validate request body against joi schema
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, role } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create & save new user
    const newUser = new User({
      name,
      email,
      passwordHash,
      role
    });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// ---------------------------------------
// POST /auth/login
// ---------------------------------------
router.post('/login', async (req, res) => {
  try {
    // Validate with joi
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const tokenPayload = { userId: user._id, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

//optional route
//This means logging in will be necessary to get token to view profile postman testing confirmed
// Protected route: GET profile
router.get('/profile', authMiddleware.authMiddleware, async (req, res) => {
  try {
    // req.user is set by the middleware
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-passwordHash'); 
      // select('-passwordHash') excludes passwordHash field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Profile Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

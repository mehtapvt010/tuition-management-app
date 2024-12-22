const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware.js');
const User = require('../models/user.model.js');

// ---------------------------------------
// POST /auth/register
// ---------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 2) Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3) Create a new user document
    const newUser = new User({
      name,
      email,
      passwordHash,
      role  // If not provided, defaults to 'student'
    });

    // 4) Save user to DB
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
    const { email, password } = req.body;

    // 1) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2) Compare password with stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3) Generate JWT token
    const tokenPayload = {
      userId: user._id,
      role: user.role
    };
    // Sign the token with your secret
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 4) Return token + basic user info
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
router.get('/profile', authMiddleware, async (req, res) => {
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

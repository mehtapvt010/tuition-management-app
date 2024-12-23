const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const classRoutes = require('./routes/class.routes');
const morgan = require('morgan');


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting: 20 requests per 15 minutes from the same IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many requests from this IP, please try again later.'
});

// Use /auth for our auth routes
// Apply rate-limiting only to /auth routes
app.use('/auth', authLimiter, authRoutes);

//admin only route
app.use('/users', userRoutes);

// Student routes
app.use('/students', studentRoutes);

// Class routes (added later)
app.use('/classes', classRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
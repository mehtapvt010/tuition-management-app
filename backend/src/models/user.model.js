const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    parentContact: {
      phone: String,
      email: String,
    },
    // Add any extra fields here, like grade, phone, etc.
    // For example:
    // grade: { type: String },
  },
  { timestamps: true } //auto adds createdAt and updatedAt fields in schema
);

module.exports = mongoose.model('User', userSchema);
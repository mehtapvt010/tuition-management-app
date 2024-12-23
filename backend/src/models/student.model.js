const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    grade: { type: String, required: true }, // e.g., '10th Grade'
    parentContact: {
      phone: String,
      email: String
    },
    notes: String
    // Additional fields as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
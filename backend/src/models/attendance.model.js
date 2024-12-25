const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
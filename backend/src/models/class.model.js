const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   // e.g. "Math 101"
    level: { type: String, required: true },  // e.g. "High School"
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);

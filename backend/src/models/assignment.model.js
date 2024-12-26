const mongoose = require('mongoose');

/*
  Each Assignment has:
    - title: String
    - description: String
    - dueDate: Date (store as noon UTC if you're using the same approach)
    - (Optional) classId: If you have classes, link to a Class model
    - submissions: array of objects = { studentId, submittedAt, fileUrl, grade, feedback }
*/

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // optional linking to class
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' , required: true },
      studentName: { type: String},
      studentEmail: { type: String},
      submittedAt: { type: Date },
      fileUrl: { type: String },    // or local file path
      textContent: { type: String },// optional if you allow text-based submission
      grade: { type: Number },      // e.g. numeric score
      feedback: { type: String }    // e.g. teacher’s comments
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
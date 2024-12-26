const Assignment = require('../models/assignment.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');
const ClassModel = require('../models/class.model'); // optional if you have classes
const path = require('path');
const { sendEmail } = require('../services/email.service');

// CREATE: Admin creates a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classId } = req.body;

    // If you want to parse `dueDate` as "YYYY-MM-DD" at noon UTC:
    let parsedDueDate = null;
    if (dueDate) {
      const [y, m, d] = dueDate.split('-');
      parsedDueDate = new Date(Date.UTC(+y, +m - 1, +d, 12, 0, 0));
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate: parsedDueDate,
      classId
    });
    const saved = await newAssignment.save();

    // Notify students (if classId exists)
    if (classId) {
      const students = await Student.find({ classId }); // Fetch students in the class
      const emailPromises = students.map((student) =>
        sendEmail(
          student.email,
          `New Assignment: ${title}`,
          `Hello ${student.name},\n\nA new assignment "${title}" has been created. Please complete it by ${new Date(dueDate).toLocaleDateString()}.\n\nDescription: ${description || 'N/A'}\n\nThank you.`,
          null
        )
      );
      await Promise.all(emailPromises); // Send all emails
    }

    return res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// READ / LIST: get all assignments or filter by class
exports.viewAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find();
    return res.status(200).json(assignments);
  } catch (error) {
    console.error('Error viewing assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// SUBMIT: Student submits assignment 
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;  // e.g. POST /assignments/:assignmentId/submit
    // The rest come from either req.body or the uploaded file
    const {textContent, studentId, studentName, studentEmail} = req.body;

    // Validate that studentId is provided
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    // Convert studentId to ObjectId if it's a string
    let validStudentId;
    try {
      validStudentId = new mongoose.Types.ObjectId(studentId);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid studentId format' });
    }
    //console.log("hello ", validStudentId);

    // If we have a file uploaded via Multer, it is available at req.file
    let fileUrl = null;
    if (req.file) {
      // e.g. local file path = "uploads/<filename>"
      fileUrl = req.file.path; // or store a full URL if needed
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if submission already exists for that student
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub) => sub.studentId.toString() === studentId
    );

    if (existingSubmissionIndex > -1) {
      // update existing submission
      assignment.submissions[existingSubmissionIndex].submittedAt = new Date();
      assignment.submissions[existingSubmissionIndex].fileUrl = fileUrl || null;
      assignment.submissions[existingSubmissionIndex].textContent = textContent || '';
    } else {
      // create new submission
      assignment.submissions.push({
        studentId: validStudentId,
        studentName: studentName,
        studentEmail: studentEmail,
        submittedAt: new Date(),
        fileUrl,
        textContent
      });
    }

    const saved = await assignment.save();
    return res.status(200).json({
      message: 'Assignment submitted successfully',
      assignment: saved
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GRADE: Admin grades submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params; 
    const { studentId, grade, feedback } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // find that student's submission
    const subIndex = assignment.submissions.findIndex(
      (s) => s.studentId.toString() === studentId
    );
    if (subIndex === -1) {
      return res.status(404).json({ message: 'Submission not found for that student' });
    }

    assignment.submissions[subIndex].grade = grade;
    assignment.submissions[subIndex].feedback = feedback;

    const saved = await assignment.save();

     // Notify the student
     console.log(studentId);
     const student = await Student.findById(studentId); // Fetch student info
     console.log(student);
     if (student) {
       await sendEmail(
         student.email,
         `Assignment Graded: ${assignment.title}`,
         `Hello ${student.name},\n\nYour submission for the assignment "${assignment.title}" has been graded.\n\nGrade: ${grade}\nFeedback: ${feedback || 'N/A'}\n\nThank you.`,
         null
       );
     }

    return res.status(200).json({
      message: 'Submission graded successfully',
      assignment: saved
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
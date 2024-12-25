const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const { sendStudentAbsenceEmail } = require('../services/email.service');

/**
 * POST /attendance
 * Body: { date, studentEmail OR studentName, status }
 * Upsert an attendance doc for that student + date.
 */
exports.markAttendanceForStudent = async (req, res) => {
  try {
    const { date, studentEmail, studentName, status } = req.body;
    if (!date || (!studentEmail && !studentName)) {
      return res.status(400).json({
        message: 'Date and studentEmail or studentName are required.'
      });
    }

    // 1) Find the student by email or name
    let student = null;
    if (studentEmail) {
      student = await Student.findOne({ email: studentEmail });
    } else if (studentName) {
      student = await Student.findOne({ name: studentName });
    }

    if (!student) {
      return res
        .status(404)
        .json({ message: 'No matching student found.' });
    }

    // 2) Convert date string (e.g. "2024-12-17") to a Date at noon UTC
    //    This prevents time zone offsets from pushing the date backward or forward.
    const [yearStr, monthStr, dayStr] = date.split('-'); // e.g. ["2024","12","17"]
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // zero-based index for month
    const day = parseInt(dayStr, 10);

    // Create the date at 12:00 UTC
    const attendanceDate = new Date(Date.UTC(year, month, day, 12, 0, 0));

    // Check if date is in the future
    const now = new Date();
    const nowUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      12, 0, 0
    ));
    if (attendanceDate > nowUTC) {
      return res.status(400).json({
        message: 'Cannot mark attendance for a future date.'
      });
    }

    // 3) Upsert logic: find by (date + studentId)
    let attendanceDoc = await Attendance.findOne({
      date: attendanceDate,
      studentId: student._id
    });

    if (!attendanceDoc) {
      // create new
      attendanceDoc = new Attendance({
        date: attendanceDate,
        studentId: student._id,
        status: status || 'present'
      });
      await attendanceDoc.save();
      
      //check for frequent absences

      const DAYS_BACK = 7;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - DAYS_BACK); // 7 days ago
      // Force noon UTC if needed
      // e.g., parse into a noon UTC date if you're consistent with your approach

      // 2) Count how many times absent in last 7 days
      const recentAbsences = await Attendance.countDocuments({
        studentId: student._id,
        status: 'absent',
        date: { $gte: sinceDate } 
      });

      if (recentAbsences >= 3) {
        // 3) Send an email
        await sendStudentAbsenceEmail(student.email, recentAbsences);
      }

      return res.status(201).json({
        message: `Created attendance for ${student.name} on ${attendanceDate.toDateString()}`,
        attendance: attendanceDoc
      });
    } else {
      // update existing status
      attendanceDoc.status = status || 'present';
      await attendanceDoc.save();
      return res.status(200).json({
        message: `Updated attendance for ${student.name} on ${attendanceDate.toDateString()}`,
        attendance: attendanceDoc
      });
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /attendance?studentEmail=...&studentName=...&date=...
 * Returns an array of attendance docs matching the filters.
 */
exports.getAttendance = async (req, res) => {
  try {
    const { studentEmail, studentName, date } = req.query;

    let student = null;
    // If user provided email or name, find that student
    if (studentEmail) {
      student = await Student.findOne({ email: studentEmail });
      if (!student) {
        return res.status(404).json({ message: 'No student with that email' });
      }
    } else if (studentName) {
      student = await Student.findOne({ name: studentName });
      if (!student) {
        return res.status(404).json({ message: 'No student with that name' });
      }
    }

    // Build a filter object
    let filter = {};
    if (student) {
      filter.studentId = student._id;
    }
    if (date) {
      const [yearStr, monthStr, dayStr] = date.split('-'); // e.g. "2024-12-17" -> ["2024","12","17"]
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // zero-based
      const day = parseInt(dayStr, 10);

      const attendanceDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
      filter.date = attendanceDate;
    }

    const docs = await Attendance.find(filter)
      .populate('studentId'); // optional: to see student name/email in the response

    return res.status(200).json(docs);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1) Find all attendance docs for that student
    const records = await Attendance.find({ studentId });

    if (!records.length) {
      return res.status(200).json({
        studentId,
        totalDays: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        presentPercent: 0,
        absentPercent: 0,
        latePercent: 0
      });
    }

    // 2) Calculate stats
    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount   = records.filter(r => r.status === 'late').length;

    const presentPercent = (presentCount / totalDays) * 100;
    const absentPercent  = (absentCount / totalDays) * 100;
    const latePercent    = (lateCount   / totalDays) * 100;

    return res.status(200).json({
      studentId,
      totalDays,
      presentCount,
      absentCount,
      lateCount,
      presentPercent,
      absentPercent,
      latePercent
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};
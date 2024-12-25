import React, { useState } from 'react';
import axios from 'axios';

const ManageAttendance = () => {
  const token = localStorage.getItem('token');

  // Mark attendance for all classes (by student)
  const [studentEmailAll, setStudentEmailAll] = useState('');
  const [studentNameAll, setStudentNameAll] = useState('');
  const [dateAll, setDateAll] = useState('');
  const [statusAll, setStatusAll] = useState('present');

  const handleMarkAllClasses = async () => {
    if (!dateAll || (!studentEmailAll && !studentNameAll)) {
      alert('Please provide a date and either student email or student name');
      return;
    }

    try {
      // Build request body for POST /attendance/markAll
      const payload = {
        date: dateAll,
        status: statusAll
      };

      // We'll assume `studentIdentifier` is for email, and `studentName` for name
      if (studentEmailAll) payload.studentIdentifier = studentEmailAll;
      if (studentNameAll) payload.studentName = studentNameAll;

      const res = await axios.post('http://localhost:5000/attendance', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message || 'Attendance updated.');
    } catch (err) {
      console.error('Error marking all classes for student:', err);
      alert('Error marking attendance');
    }
  };

  return (
    <div>
      <h2>Manage Attendance</h2>
      <h3>Mark Attendance for All Classes (by Student)</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label>Date:</label>
        <input
          type="date"
          value={dateAll}
          onChange={(e) => setDateAll(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Student Email:</label>
        <input
          type="email"
          value={studentEmailAll}
          onChange={(e) => setStudentEmailAll(e.target.value)}
          placeholder="john@example.com"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>OR Student Name:</label>
        <input
          type="text"
          value={studentNameAll}
          onChange={(e) => setStudentNameAll(e.target.value)}
          placeholder="John Doe"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Status:</label>
        <select
          value={statusAll}
          onChange={(e) => setStatusAll(e.target.value)}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      <button onClick={handleMarkAllClasses}>Mark Student</button>
    </div>
  );
};

export default ManageAttendance;

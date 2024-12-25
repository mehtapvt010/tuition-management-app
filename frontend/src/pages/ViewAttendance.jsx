import React, { useState } from 'react';
import axios from 'axios';

const ViewAttendance = () => {
  const token = localStorage.getItem('token'); // or use cookies if you prefer

  // Existing states for searching attendance
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // New: We'll store analytics in this state object
  const [analytics, setAnalytics] = useState(null);

  // 1) Fetch attendance docs
  const handleFetchAttendance = async () => {
    try {
      // Build the query string based on the fields provided
      let query = '?';
      if (studentEmail) {
        query += `studentEmail=${encodeURIComponent(studentEmail)}&`;
      }
      if (studentName) {
        query += `studentName=${encodeURIComponent(studentName)}&`;
      }
      if (date) {
        query += `date=${encodeURIComponent(date)}&`;
      }

      // Call GET /attendance?studentEmail=...&studentName=...&date=...
      const res = await axios.get(`http://localhost:5000/attendance${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 'res.data' should be an array of attendance docs (one doc per date).
      setAttendanceRecords(res.data);

      // Clear any previous analytics if we do a new search
      setAnalytics(null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error fetching attendance. Check console for details.');
    }
  };

  // 2) (Optional) Once we have attendanceRecords, we can fetch analytics
  //    We only do this if the student is consistent (likely only 1 student).
  //    If multiple docs reference the same student, they should have the same studentId.
  //    We'll just use the first record's studentId, or none if empty.

  const handleFetchAnalytics = async () => {
    try {
      if (attendanceRecords.length === 0) {
        alert('No attendance records found yet. Please fetch attendance first.');
        return;
      }

      // We'll assume they all belong to one student. Let's take the first record's studentId
      const firstRecord = attendanceRecords[0];
      if (!firstRecord.studentId) {
        alert('Attendance docs do not include studentId. Cannot fetch analytics.');
        return;
      }

      const studentId = firstRecord.studentId._id; // or just firstRecord.studentId if it's a string
      // GET /attendance/analytics/:studentId
      const res = await axios.get(
        `http://localhost:5000/attendance/analytics/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Error fetching analytics.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>View Attendance (Per Student)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Student Email:</strong> </label>
        <input
          type="email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          placeholder="e.g. john@example.com"
          style={{ marginLeft: '1rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Student Name:</strong> </label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="e.g. John Doe"
          style={{ marginLeft: '1rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label><strong>Date:</strong> </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
      </div>

      <button onClick={handleFetchAttendance} style={{ marginBottom: '1rem', marginRight: '1rem' }}>
        Fetch Attendance
      </button>

      {/* Only show "Get Analytics" if we found at least 1 record */}
      {attendanceRecords.length > 0 && (
        <button onClick={handleFetchAnalytics} style={{ marginBottom: '1rem' }}>
          Get Analytics
        </button>
      )}

      <hr />

      {attendanceRecords.length === 0 ? (
        <p>No attendance found or no query made yet.</p>
      ) : (
        <div>
          <h3>Results:</h3>
          {attendanceRecords.map((record) => (
            <div
              key={record._id}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                marginBottom: '1rem'
              }}
            >
              <p><strong>Attendance ID:</strong> {record._id}</p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(record.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {record.status}
              </p>
              {record.studentId && (
                <p>
                  <strong>Student:</strong> {record.studentId.name} (
                  {record.studentId.email})
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Analytics Section */}
      {analytics && (
        <div style={{ marginTop: '2rem', border: '1px dashed #ccc', padding: '1rem' }}>
          <h3>Analytics for Student {analytics.studentId}</h3>
          <p><strong>Total Days:</strong> {analytics.totalDays}</p>
          <p><strong>Present Count:</strong> {analytics.presentCount}</p>
          <p><strong>Absent Count:</strong> {analytics.absentCount}</p>
          <p><strong>Late Count:</strong> {analytics.lateCount}</p>
          <p><strong>Present %:</strong> {analytics.presentPercent?.toFixed(2)}</p>
          <p><strong>Absent %:</strong> {analytics.absentPercent?.toFixed(2)}</p>
          <p><strong>Late %:</strong> {analytics.latePercent?.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;
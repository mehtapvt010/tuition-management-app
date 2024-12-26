import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentAssignments = () => {
  const token = localStorage.getItem('token');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // We'll store the file in local state
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [textContent, setTextContent] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setTextContent('');
    setAssignmentFile(null);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    const userId = localStorage.getItem('userId');
    const studentName = localStorage.getItem('userName');
    const studentEmail = localStorage.getItem('userEmail');
    console.log('Submitting assignment with studentId:', userId); // Add this line

    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      // We'll create a FormData object for file uploads
      const formData = new FormData();
      formData.append('studentId', userId);
      formData.append('studentName', studentName);
      formData.append('studentEmail', studentEmail);
      formData.append('textContent', textContent);
      if (assignmentFile) {
        // "assignmentFile" must match the uploadSingleFile field name
        formData.append('assignmentFile', assignmentFile);
      }

      await axios.post(
        `http://localhost:5000/assignments/${selectedAssignment._id}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Submitted successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Error submitting assignment:', err);
    }
  };

  return (
    <div>
      <h2>My Assignments</h2>
      <ul>
        {assignments.map(a => (
          <li key={a._id} onClick={() => handleSelectAssignment(a)}>
            <strong>{a.title}</strong> - Due: {a.dueDate?.slice(0,10)}
          </li>
        ))}
      </ul>

      {selectedAssignment && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Submit for: {selectedAssignment.title}</h3>
          <div>
            <label>Text Content (optional):</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>
          <div>
            <label>File (optional):</label>
            <input
              type="file"
              onChange={(e) => setAssignmentFile(e.target.files[0])}
            />
          </div>
          <button onClick={handleSubmitAssignment} style={{ marginTop: '0.5rem' }}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
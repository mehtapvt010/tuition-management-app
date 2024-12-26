import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAssignmentsAdmin = () => {
  const token = localStorage.getItem('token');

  // State for creating a new assignment
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // State for listing assignments and their submissions
  const [assignments, setAssignments] = useState([]);

  // Fetch all assignments on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Function to fetch all assignments
  const fetchAssignments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  // Function to handle creating a new assignment
  const handleCreateAssignment = async () => {
    if (!title || !dueDate) {
      alert('Please provide at least a title and due date.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/assignments',
        { title, description, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('Failed to create assignment.');
    }
  };

  // Function to handle grading a submission
  const handleGradeSubmission = async (assignmentId, submission, grade, feedback) => {
    if (grade === '' || grade < 0 || grade > 100) {
      alert('Please provide a valid grade between 0 and 100.');
      return;
    }

    if (!submission.studentId) {
      alert('Cannot grade submission: Student information is missing.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/assignments/${assignmentId}/grade`,
        {
          studentId: submission.studentId,
          grade: Number(grade),
          feedback,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Submission graded successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('Failed to grade submission.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Manage Assignments (Admin)</h2>

      {/* Create Assignment Form */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }}>
        <h3>Create New Assignment</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginLeft: '1rem', width: '60%' }}
            placeholder="Assignment Title"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ marginLeft: '1rem', width: '60%', height: '100px' }}
            placeholder="Assignment Description"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ marginLeft: '1rem' }}
          />
        </div>
        <button onClick={handleCreateAssignment}>Create Assignment</button>
      </div>

      {/* List of Assignments */}
      <div>
        <h3>Existing Assignments</h3>
        {assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment._id}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                marginBottom: '1.5rem',
                borderRadius: '5px',
              }}
            >
              <h4>{assignment.title}</h4>
              <p><strong>Description:</strong> {assignment.description || 'No description provided.'}</p>
              <p><strong>Due Date:</strong> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</p>
              <h5>Submissions:</h5>
              {assignment.submissions.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                assignment.submissions.map((submission, index) => (
                  <div
                    key={submission._id || index}
                    style={{
                      border: '1px solid #eee',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      borderRadius: '3px',
                    }}
                  >
                    {/* Conditional Rendering for Student Information */}
                    <p>
                      <strong>Student : </strong> 
                      {submission.studentId ? (
                        <>
                          {submission.studentName} ({submission.studentEmail})
                        </>
                      ) : (
                        'Unknown Student'
                      )}
                    </p>
                    <p><strong>Submitted At:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}</p>
                    {submission.textContent && (
                      <p><strong>Submission:</strong> {submission.textContent}</p>
                    )}
                    {submission.fileUrl && (
                      <p>
                        <strong>File:</strong>{' '}
                        <a href={`http://localhost:5000/${submission.fileUrl}`} target="_blank" rel="noopener noreferrer">
                          View File
                        </a>
                      </p>
                    )}
                    <div style={{ marginTop: '0.5rem' }}>
                      <label>Grade:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 85"
                        style={{ marginLeft: '0.5rem', width: '60px' }}
                        defaultValue={submission.grade !== undefined ? submission.grade : ''}
                        onChange={(e) => {
                          // Update grade in the submission object
                          submission.grade = e.target.value;
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label>Feedback:</label>
                      <textarea
                        placeholder="Provide feedback"
                        style={{ marginLeft: '0.5rem', width: '80%', height: '60px' }}
                        defaultValue={submission.feedback || ''}
                        onChange={(e) => {
                          // Update feedback in the submission object
                          submission.feedback = e.target.value;
                        }}
                      />
                    </div>
                    <button
                      style={{ marginTop: '0.5rem' }}
                      onClick={() => handleGradeSubmission(assignment._id, submission, submission.grade, submission.feedback)}
                    >
                      Save Grade
                    </button>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAssignmentsAdmin;
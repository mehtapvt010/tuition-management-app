import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]); // for filtered view
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [parentContact, setParentContact] = useState({ phone: '', email: '' });
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // or user choice?

  const [editingStudentId, setEditingStudentId] = useState(null);
  const token = localStorage.getItem('token'); // or handle cookies

  // 1) The main fetch function
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/students?search=${searchTerm}&page=${currentPage}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.students);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Next/Prev
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 2) useEffect that runs whenever `searchTerm` or `currentPage` changes
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [searchTerm, currentPage]);
  

  // 3) handleSearchChange - sets searchTerm AND reset page to 1
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);  // always reset to page 1 on new search
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        grade,
        parentContact,
        notes
      };
      if (editingStudentId) {
        await axios.put(`http://localhost:5000/students/${editingStudentId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/students', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchStudents(); // refresh list
      setName(''); setEmail(''); setGrade('');
      setParentContact({ phone: '', email: '' });
      setNotes('');
      setEditingStudentId(null);
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  const handleEdit = (student) => {
    setEditingStudentId(student._id);
    setName(student.name);
    setEmail(student.email);
    setGrade(student.grade);
    setParentContact(student.parentContact || { phone: '', email: '' });
    setNotes(student.notes || '');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <div>
      <h2>Manage Students</h2>

      {/* Search input */}
      <div>
        <label>Search: </label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Type name, email, or grade"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <h3>{editingStudentId ? 'Edit Student' : 'Add New Student'}</h3>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Grade:</label>
          <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} required />
        </div>
        <div>
          <label>Parent Phone:</label>
          <input
            type="text"
            value={parentContact.phone}
            onChange={(e) => setParentContact({ ...parentContact, phone: e.target.value })}
          />
        </div>
        <div>
          <label>Parent Email:</label>
          <input
            type="email"
            value={parentContact.email}
            onChange={(e) => setParentContact({ ...parentContact, email: e.target.value })}
          />
        </div>
        <div>
          <label>Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">{editingStudentId ? 'Update' : 'Create'}</button>
      </form>

      <h3>Existing Students</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Grade</th>
            <th>Parent Contact</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.grade}</td>
              <td>
                {s.parentContact
                  ? `${s.parentContact.phone || ''}, ${s.parentContact.email || ''}`
                  : ''}
              </td>
              <td>{s.notes}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Prev</button>
        <span> Page {currentPage} of {totalPages} </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default ManageStudents;

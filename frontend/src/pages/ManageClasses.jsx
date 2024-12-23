import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const [editingClassId, setEditingClassId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, level, students };
      if (editingClassId) {
        await axios.put(`http://localhost:5000/classes/${editingClassId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/classes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchClasses();
      setName('');
      setLevel('');
      setStudents([]);
      setEditingClassId(null);
    } catch (err) {
      console.error('Error saving class:', err);
    }
  };

  const handleEdit = (cls) => {
    setEditingClassId(cls._id);
    setName(cls.name);
    setLevel(cls.level);
    // If cls.students is an array of objects (populated), map them to _id
    const studentIds = cls.students.map(s => (typeof s === 'object' ? s._id : s));
    setStudents(studentIds);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  // Toggling student IDs in array
  const handleStudentSelect = (studentId) => {
    if (students.includes(studentId)) {
      setStudents(students.filter(id => id !== studentId));
    } else {
      setStudents([...students, studentId]);
    }
  };

  return (
    <div>
      <h2>Manage Classes</h2>
      <form onSubmit={handleSubmit}>
        <h3>{editingClassId ? 'Edit Class' : 'Add New Class'}</h3>
        <div>
          <label>Class Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Level:</label>
          <input
            type="text"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Students:</label>
          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
            {allStudents.map(st => (
              <div key={st._id}>
                <input
                  type="checkbox"
                  checked={students.includes(st._id)}
                  onChange={() => handleStudentSelect(st._id)}
                />
                {st.name} ({st.email})
              </div>
            ))}
          </div>
        </div>

        <button type="submit">
          {editingClassId ? 'Update Class' : 'Create Class'}
        </button>
      </form>

      <h3>Existing Classes</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Level</th>
            <th>Students</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls._id}>
              <td>{cls.name}</td>
              <td>{cls.level}</td>
              <td>
                {cls.students?.map(s =>
                  typeof s === 'object' ? s.name : s
                ).join(', ')}
              </td>
              <td>
                <button onClick={() => handleEdit(cls)}>Edit</button>
                <button onClick={() => handleDelete(cls._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageClasses;

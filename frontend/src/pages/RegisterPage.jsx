// RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');

  //testing stuff
  // We'll store form validation errors in an object
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // A simple validation function
function validateForm({ name, email, password }) {
  const errors = {};

  if (name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long.';
  }

  // Basic email format check (not super robust)
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return errors;
}

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setFormErrors({});

    // 1) Validate input
    const errors = validateForm({ name, email, password });
    if (Object.keys(errors).length > 0) {
      // If errors exist, update state and stop here
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true); // We'll show a loading message/spinner
      const res = await axios.post('http://localhost:5000/auth/register', {
        name,
        email,
        password,
        role
      });
      setLoading(false);
      if (res.status === 201) {
        setMessage('User registered successfully!');
        // Clear fields if you want
        setName('');
        setEmail('');
        setPassword('');
        setRole('student');
        setSuccessMessage('User registered successfully!');
      }
    } catch (err) {
      setLoading(false);
      if (err.response) {
        // Could store this in formErrors or a separate errorMessage state
        setMessage(err.response.data.message);
        //setFormErrors({ global: err.response.data.message });
      } else {
        setMessage('Registration failed');
        setFormErrors({ global: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {loading && <Spinner />}
      <form onSubmit={handleRegister}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {formErrors.name && <p style={{ color: 'red' }}>{formErrors.name}</p>}
        </div>

        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}
        </div>

        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {formErrors.password && <p style={{ color: 'red' }}>{formErrors.password}</p>}
        </div>

        <div>
          <label>Role: </label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
      {formErrors.name && <p style={{ color: 'red' }}>{formErrors.name}</p>}
      {formErrors.global && <p style={{ color: 'red' }}>{formErrors.global}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;

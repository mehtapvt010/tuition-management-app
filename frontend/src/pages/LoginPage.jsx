// LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

// Simple validation function (client-side checks)
function validateLoginForm({ email, password }) {
  const errors = {};

  // Basic email format check
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = 'Invalid email address.';
  }
  if (password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage('');

    // 1) Validate inputs before sending request
    const errors = validateLoginForm({ email, password });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // 2) If valid, call backend /auth/login
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });
      setLoading(false);

      // 3) Handle success

      if(res.status === 200) {
        const { token, user } = res.data;

        // For localStorage approach:
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);

        setSuccessMessage('Logged in successfully!');

        // Optionally redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1500);
      }

    } catch (err) {
      setLoading(false);
      // 4) Handle errors
      if (err.response) {
        setFormErrors({ global: err.response.data.message });
      } else {
        setFormErrors({ global: 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Loading spinner or message */}
      {loading && <Spinner />}
      {/* or {loading && <p>Loading...</p>} */}

      <form onSubmit={handleLogin}>
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

        {formErrors.password && (<p style={{ color: 'red' }}>{formErrors.password}</p>)}
        </div>

        <button type="submit">{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      {/* Global error message */}
      {formErrors.global && <p style={{ color: 'red' }}>{formErrors.global}</p>}

      {/* Success message */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default LoginPage;

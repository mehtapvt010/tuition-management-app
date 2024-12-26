import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManageStudents from './pages/ManageStudents';
import ManageClasses from './pages/ManageClasses';
import ManageAttendance from './pages/ManageAttendance';
import ViewAttendance from './pages/ViewAttendance';
import ManageAssignmentsAdmin from './pages/ManageAssignmentsAdmin';
import StudentAssignments from './pages/StudentAssignments';
import './App.css';

function App() {
  return (
    <div id="root">
      <header className="header">
        <h1 className="app-title">School Management System</h1>
        <p className="tagline">Streamline your education workflow efficiently.</p>
      </header>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main>
        <div className="hero">
          <h2>Welcome to the School Management System</h2>
          <p>
            A one-stop solution for managing classes, students, attendance, and assignments. Get started
            by registering or logging in.
          </p>
          <button><a href="/register">Get Started</a></button>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/classes" element={<ManageClasses />} />
          <Route path="/admin/attendance" element={<ManageAttendance />} />
          <Route path="/admin/attendance/view" element={<ViewAttendance />} />
          <Route path="/admin/assignments" element={<ManageAssignmentsAdmin />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 School Management System. All rights reserved.</p>
        <p>
          <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import httpClient from './httpClient';
import Login from './Login';

import Dashboard from './Dashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import Application from './Application'; 
import Review from './Review';
import Thesis from './Thesis';
import DefendingsPage from './DefendingsPage';

import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);

  const handleLogin = async (username, password) => {
    try {
      const response = await httpClient.post('/api/v1/auth/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Decode the token to get user details
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);  

      const role = decodedToken?.role;
      const usernameFromToken = decodedToken?.sub;
      setUserData({ username: usernameFromToken, role });

      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete httpClient.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="container mt-5" style={{ backgroundColor: 'lightblue' }}>
        <div className="text-center mb-4">
          <h1 className="display-4">University Portal</h1>
        </div>
        <Routes>
          {/* Login or Dashboard Route */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                userData?.role === 'ROLE_TEACHER' ? (
                  <TeacherDashboard onLogout={handleLogout} userData={userData} />
                ) : (
                  <StudentDashboard onLogout={handleLogout} userData={userData} />
                )
              ) : (
                <div className="card p-4 shadow-sm">
                  <Login onLogin={handleLogin} />
                </div>
              )
            }
          />
          
          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                userData?.role === 'ROLE_TEACHER' ? (
                  <TeacherDashboard onLogout={handleLogout} userData={userData} />
                ) : (
                  <StudentDashboard onLogout={handleLogout} userData={userData} />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
          
          {/* Teacher Application Page Route */}
          <Route
            path="/application"
            element={
              isLoggedIn && userData?.role === 'ROLE_TEACHER' ? (
                <Application />
              ) : (
                <Navigate to="/" /> // Redirect if not a teacher or not logged in
              )
            }
          />

            <Route
            path="/review/:thesisId"
            element={
              isLoggedIn && userData?.role === 'ROLE_TEACHER' ? (
                <Review />
              ) : (
                <Navigate to="/" /> // Redirect if not a teacher or not logged in
              )
            }
          />
 
            <Route
            path="/thesis/:applicationId"
            element={
              isLoggedIn && userData?.role === 'ROLE_STUDENT' ? (
                <Thesis />
              ) : (
                <Navigate to="/" /> // Redirect if not a student or not logged in
              )
            }
          />

            <Route path="/defendings" element={<DefendingsPage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

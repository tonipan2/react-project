import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from './httpClient';
import { jwtDecode } from 'jwt-decode';

function Application({ userData }) {
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState({
    theme: '',
    aim: '',
    tasks: '',
    technologies: '',
    studentId: '', // Will be selected from the dropdown
    teacherId: '', // Will be fetched dynamically
    acceptanceType: 'UNDEFINED', // Default value for acceptance
  });

  const [students, setStudents] = useState([]); // Store the list of students

  useEffect(() => {
    // Fetch students from the backend
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token
        const response = await httpClient.get('/student/fetch/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStudents(response.data); // Populate the students array
      } catch (error) {
        console.error('Error fetching students:', error);
        alert('Failed to load students. Please try again later.');
      }
    };

    // Fetch the teacher ID based on the logged-in user's ID
    const fetchTeacherId = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token
        const decodedToken = jwtDecode(token);
        const usernameFromToken = decodedToken?.sub;

        // Fetch teacher data based on the logged-in user's username
        const response = await httpClient.get(`/teacher/fetchByUsername/${usernameFromToken}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          },
      });

        
        if (response.data && response.data.id) {
          // Directly update the teacherId in the applicationData
          setApplicationData((prev) => ({
            ...prev,
            teacherId: response.data.id, // Assign teacherId directly from the fetched response
          }));
          console.log('Teacher ID fetched and set:', response.data.id); // Debug log
        } else {
          console.error('Teacher data is invalid:', response.data);
          alert('Failed to fetch valid teacher information.');
        }
      } catch (error) {
        console.error('Error fetching teacher ID:', error);
        alert('Failed to fetch teacher information. Please try again later.');
      }
    };
    

    fetchStudents();
    //if (userData?.id) {
      fetchTeacherId();
    //}
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!applicationData.teacherId) {
      alert('Teacher ID is missing. Please try again.');
      return;
    }

    try {
      console.log('Submitting Application Data:', applicationData); // Debug log
      const response = await httpClient.post(
        '/application/add',
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Add the token here
          },
        }
      );
      alert('Application submitted successfully');
      setApplicationData({
        theme: '',
        aim: '',
        tasks: '',
        technologies: '',
        studentId: '',
        teacherId: applicationData.teacherId, // Persist the teacherId
        acceptanceType: 'UNDEFINED',
      });
      navigate('/dashboard'); // Redirect to the dashboard after submission
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit the application. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Submit an Application</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="theme" className="form-label">Theme</label>
          <input
            type="text"
            id="theme"
            name="theme"
            className="form-control"
            value={applicationData.theme}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="aim" className="form-label">Aim</label>
          <input
            type="text"
            id="aim"
            name="aim"
            className="form-control"
            value={applicationData.aim}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="tasks" className="form-label">Tasks</label>
          <textarea
            id="tasks"
            name="tasks"
            className="form-control"
            value={applicationData.tasks}
            onChange={handleInputChange}
            rows="3"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="technologies" className="form-label">Technologies</label>
          <textarea
            id="technologies"
            name="technologies"
            className="form-control"
            value={applicationData.technologies}
            onChange={handleInputChange}
            rows="2"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="studentId" className="form-label">Student</label>
          <select
            id="studentId"
            name="studentId"
            className="form-control"
            value={applicationData.studentId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.facultyNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="acceptanceType" className="form-label">Acceptance Type</label>
          <select
            id="acceptanceType"
            name="acceptanceType"
            className="form-control"
            value={applicationData.acceptanceType}
            onChange={handleInputChange}
            required
          >
            <option value="UNDEFINED">UNDEFINED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="DENIED">DENIED</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default Application;

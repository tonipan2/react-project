import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import httpClient from './httpClient';
import { jwtDecode } from 'jwt-decode';

function StudentDashboard({ userData, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [theses, setTheses] = useState([]); // State for theses
  const [defendings, setDefendings] = useState([]); // State for defendings
  const navigate = useNavigate(); // Initialize navigation hook
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const usernameFromToken = decodedToken?.sub;

        const response = await httpClient.get(`/student/fetchByUsername/${usernameFromToken}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.id) {
          setStudentId(response.data.id);
        } else {
          alert('Failed to fetch valid student information.');
        }
      } catch (error) {
        alert('Failed to fetch student information. Please try again later.');
      }
    };

    fetchStudentId();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await httpClient.get(`/student/fetchApplications/${studentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setApplications(response.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        alert('Failed to load applications. Please try again later.');
      }
    };

    if (studentId) {
      fetchApplications();
    }
  }, [studentId]);

  useEffect(() => {
    const fetchThesesAndReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(`/student/fetchTheses/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const thesesWithReviews = await Promise.all(
          response.data.map(async (thesis) => {
            try {
              const reviewResponse = await httpClient.get(`/review/fetchByThesisId/${thesis.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              return {
                ...thesis,
                review: reviewResponse.data || null, // Add the review data or null if not found
              };
            } catch (error) {
              console.error(`Error fetching review for thesis ID ${thesis.id}:`, error);
              return { ...thesis, review: null }; // Gracefully handle missing reviews
            }
          })
        );

        setTheses(thesesWithReviews);
      } catch (error) {
        console.error('Error fetching theses or reviews:', error);
        alert('Failed to load theses or reviews. Please try again later.');
      }
    };

    if (studentId) {
      fetchThesesAndReviews();
    }
  }, [studentId]);

  // New effect for fetching defendings
  useEffect(() => {
    const fetchDefendings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await httpClient.get(`/student/fetchDefendings/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDefendings(response.data);
      } catch (error) {
        console.error('Error fetching defendings:', error);
        alert('Failed to load defendings. Please try again later.');
      }
    };

    if (studentId) {
      fetchDefendings();
    }
  }, [studentId]);

  const handleSubmitThesis = (applicationId) => {
    // Navigate to the Thesis page with the application ID
    navigate(`/thesis/${applicationId}`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Student Dashboard</h2>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm rounded">
        <span className="navbar-brand">Welcome, {userData?.username}!</span>
        <div>
          <button className="btn btn-outline-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="accordion-item mt-4">
        <h2 className="accordion-header">Your Applications</h2>
        <div className="accordion-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Theme</th>
                <th>Aim</th>
                <th>Tasks</th>
                <th>Technologies</th>
                <th>Acceptance Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.id}</td>
                    <td>{application.theme}</td>
                    <td>{application.aim}</td>
                    <td>{application.tasks}</td>
                    <td>{application.technologies}</td>
                    <td>{application.acceptanceType}</td>
                    <td>
                      {application.acceptanceType === 'ACCEPTED' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSubmitThesis(application.id)}
                        >
                          Submit Thesis
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Theses Table */}
      <div className="accordion-item mt-4">
        <h2 className="accordion-header">Your Theses</h2>
        <div className="accordion-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date Uploaded</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {theses.length > 0 ? (
                theses.map((thesis) => (
                  <tr key={thesis.id}>
                    <td>{thesis.id}</td>
                    <td>{thesis.name}</td>
                    <td>{thesis.dateUploaded}</td>
                    <td>
                      {thesis.review ? (
                        thesis.review.conclusion ? 'Yes' : 'No'
                      ) : (
                        'No Review Available'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No theses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grades from Defendings Table */}
      <div className="accordion-item mt-4">
        <h2 className="accordion-header">Grades from Defendings</h2>
        <div className="accordion-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Defending ID</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {defendings.length > 0 ? (
                defendings.map((defending) => (
                  <tr key={defending.id}>
                    <td>{defending.id}</td>
                    <td>{defending.grade || 'No grade yet'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No defendings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

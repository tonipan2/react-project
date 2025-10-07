import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from './httpClient';
import {jwtDecode} from 'jwt-decode';

function TeacherDashboard({ userData, onLogout }) {
  const navigate = useNavigate();

  const goToDefendingsPage = () => {
    navigate('/defendings');
  };

  const [teacherId, setTeacherId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [theses, setTheses] = useState([]);
  const [defendings, setDefendings] = useState([]); 
  const [activePocket, setActivePocket] = useState(null);
  const [showDefendingForm, setShowDefendingForm] = useState(false); // Show/Hide the form
  const [defendingDate, setDefendingDate] = useState(''); // Capture the defending date
  const [editingApplication, setEditingApplication] = useState(null); // Tracks the application being edited
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(''); // Start date for filtering graduated students
  const [endDate, setEndDate] = useState(''); // End date for filtering graduated students
  const [graduatedStudents, setGraduatedStudents] = useState([]);
  const [negativeReviewCount, setNegativeReviewCount] = useState(0);
  const [averageDefendingStudents, setAverageDefendingStudents] = useState(null);
  const [filterTeacherName, setFilterTeacherName] = useState('');





  useEffect(() => {
    const fetchTeacherId = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const usernameFromToken = decodedToken?.sub;

        const response = await httpClient.get(`/teacher/fetchByUsername/${usernameFromToken}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.id) {
          setTeacherId(response.data.id);
        } else {
          alert('Failed to fetch valid teacher information.');
        }
      } catch (error) {
        alert('Failed to fetch teacher information. Please try again later.');
      }
    };

    fetchTeacherId();
  }, []);

  useEffect(() => {
    if (teacherId) {
      const fetchApplications = async () => {
        try {
          const response = await httpClient.get(`/teacher/fetchApplications/${teacherId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setApplications(response.data);
        } catch (error) {
          alert('Failed to load applications. Please try again later.');
        }
      };

      const fetchDefendings = async () => {
        try {
          const response = await httpClient.get(`/teacher/fetchDefendings/${teacherId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setDefendings(response.data);
        } catch (error) {
          alert('Failed to load defendings. Please try again later.');
        }
      };

      fetchApplications();
      fetchDefendings();
    }

    const fetchNegativeReviewCount = async () => {
      try {
        const response = await httpClient.get(`/review/negative-review-count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setNegativeReviewCount(response.data); // Assuming the response is { count: number }
      } catch (error) {
        console.error('Failed to fetch negative reviews count', error);
        setNegativeReviewCount(0); // Default to 0 if there is an error
      }
    };
  
    
      fetchNegativeReviewCount();
  }, [teacherId]);

  const handleAddDefending = async (e) => {
    e.preventDefault();
    if (!defendingDate) {
      alert('Please select a defending date.');
      return;
    }

    try {
      const response = await httpClient.post(
        `/defending/add?teacherId=${teacherId}`,
        { dateDefending: defendingDate },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Defending scheduled successfully!');
        setDefendings((prev) => [...prev, response.data]); // Add new defending to the list
        setShowDefendingForm(false); // Hide the form
        setDefendingDate(''); // Reset the form
      } else {
        alert('Failed to schedule defending. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while scheduling defending. Please try again later.');
    }
  };

  const handleFetchAverageDefendingStudents = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      const response = await httpClient.get(
        `/defending/average-students?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setAverageDefendingStudents(response.data); // Assuming the response is a number
    } catch (error) {
      alert('Failed to fetch the average defending students. Please try again later.');
    }
  };

  const fetchTheses = async () => {
    try {
      const response = await httpClient.get('http://localhost:8080/thesis/fetch/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTheses(response.data);
    } catch (error) {
      alert('Failed to load theses. Please try again later.');
    }
  };

  const handleAddApplication = () => {
    navigate('/application');
  };

  const handleReviewThesis = (thesisId) => {
    navigate(`/review/${thesisId}`);
  };

  //const handleScheduleDefending = () => {
    //navigate('/defending');
 // };

  const togglePocket = (pocket) => {
    setActivePocket(activePocket === pocket ? null : pocket);
    if (pocket === 'theses' && activePocket !== 'theses') {
      fetchTheses();
    }
  };

  const startEditingApplication = (application) => {
    setEditingApplication(application);
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setEditingApplication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.patch(
        `http://localhost:8080/application/edit/${editingApplication.id}`,
        editingApplication,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('Application updated successfully!');
        setApplications((prev) =>
          prev.map((app) =>
            app.id === editingApplication.id ? editingApplication : app
          )
        );
        setEditingApplication(null); // Close the editing menu
      } else {
        alert('Failed to update application. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while updating the application. Please try again later.');
    }
  };

  const filteredApplications = filterType
  ? applications.filter((app) => app.acceptanceType === filterType)
  : applications;

  const filteredTheses = theses.filter((thesis) =>
    thesis.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleFetchGraduatedStudents = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      const response = await httpClient.get(
        `/thesis-defendings/students?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setGraduatedStudents(response.data);
    } catch (error) {
      alert('Failed to fetch graduated students. Please try again later.');
    }
  };

  const handleFetchDefendingData = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      const response = await httpClient.get(
        `/defending/average-students?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setGraduatedStudents(response.data); // Assuming response has a list of students
    } catch (error) {
      alert('Failed to fetch defending students. Please try again later.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Teacher Dashboard</h1>
        <button className="btn btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="accordion">
        {/* Pocket 1: Your Applications */}
        <div className="accordion-item">
  <h2 className="accordion-header">
    <button
      className={`accordion-button ${
        activePocket === 'applications' ? '' : 'collapsed'
      }`}
      onClick={() => togglePocket('applications')}
    >
      Your Applications
    </button>
  </h2>
  <div
    className={`accordion-collapse collapse ${
      activePocket === 'applications' ? 'show' : ''
    }`}
  >
    <div className="accordion-body">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleAddApplication}>
          Add Application
        </button>
        <div>
          <label htmlFor="acceptanceTypeFilter" className="me-2">
            Filter by Acceptance Type:
          </label>
          <select
            id="acceptanceTypeFilter"
            className="form-select"
            style={{ width: '200px', display: 'inline-block' }}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All</option>
            <option value="UNDEFINED">UNDEFINED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="DENIED">DENIED</option>
          </select>
        </div>
        <div>
          <label htmlFor="teacherNameFilter" className="me-2">
            Filter by Teacher:
          </label>
          <select
            id="teacherNameFilter"
            className="form-select"
            style={{ width: '200px', display: 'inline-block' }}
            onChange={(e) => setFilterTeacherName(e.target.value)}
          >
            <option value="">All</option>
            {Array.from(
              new Set(
                filteredApplications.map(
                  (application) =>
                    `${application.teacher?.user?.firstName || ''} ${
                      application.teacher?.user?.lastName || ''
                    }`
                )
              )
            ).map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Theme</th>
            <th>Aim</th>
            <th>Tasks</th>
            <th>Technologies</th>
            <th>Teacher</th>
            <th>Acceptance Type</th>
            <th>EDIT</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications
            .filter((application) => {
              if (!filterTeacherName) return true;
              const teacherName = `${application.teacher?.user?.firstName || ''} ${
                application.teacher?.user?.lastName || ''
              }`;
              return teacherName.includes(filterTeacherName);
            })
            .map((application) => (
              <tr key={application.id}>
                <td>{application.id}</td>
                <td>{application.theme}</td>
                <td>{application.aim}</td>
                <td>{application.tasks}</td>
                <td>{application.technologies}</td>
                <td>
                  {application.teacher?.user?.firstName}{' '}
                  {application.teacher?.user?.lastName}
                </td>
                <td>{application.acceptanceType}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => startEditingApplication(application)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {editingApplication && (
        <div className="mt-4">
          <h3>Edit Application</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="theme" className="form-label">
                Theme
              </label>
              <input
                type="text"
                className="form-control"
                id="theme"
                name="theme"
                value={editingApplication.theme}
                onChange={handleApplicationChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="aim" className="form-label">
                Aim
              </label>
              <textarea
                className="form-control"
                id="aim"
                name="aim"
                value={editingApplication.aim}
                onChange={handleApplicationChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="tasks" className="form-label">
                Tasks
              </label>
              <textarea
                className="form-control"
                id="tasks"
                name="tasks"
                value={editingApplication.tasks}
                onChange={handleApplicationChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="technologies" className="form-label">
                Technologies
              </label>
              <textarea
                className="form-control"
                id="technologies"
                name="technologies"
                value={editingApplication.technologies}
                onChange={handleApplicationChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="acceptanceType" className="form-label">
                Acceptance Type
              </label>
              <select
                className="form-control"
                id="acceptanceType"
                name="acceptanceType"
                value={editingApplication.acceptanceType}
                onChange={handleApplicationChange}
              >
                <option value="UNDEFINED">UNDEFINED</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="DENIED">DENIED</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setEditingApplication(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  </div>
</div>



        {/* Pocket 2: Theses to Review */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button ${activePocket === 'theses' ? '' : 'collapsed'}`}
              onClick={() => togglePocket('theses')}
            >
              Theses to Review
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${activePocket === 'theses' ? 'show' : ''}`}>
            
            <div className="accordion-body">

            <div className="mb-3">
              <label htmlFor="searchTheses" className="form-label">
                Search by Name:
              </label>
              <input
                type="text"
                id="searchTheses"
                className="form-control"
                placeholder="Enter part of the name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Text</th>
                    <th>Date Uploaded</th>
                    <th>REVIEW</th>
                  </tr>
                </thead>
                  <tbody>
                    {filteredTheses.length > 0 ? (
                      filteredTheses.map((thesis) => (
                        <tr key={thesis.id}>
                          <td>{thesis.id}</td>
                          <td>{thesis.name}</td>
                          <td>{thesis.text}</td>
                          <td>{thesis.dateUploaded}</td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleReviewThesis(thesis.id)}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No theses found.
                        </td>
                      </tr>
                    )}
                  </tbody>

              </table>
              <div className="d-flex justify-content-between mb-3">
                <h5>Negative Reviews</h5>
                <span className="badge bg-danger">
                   {negativeReviewCount} students with negative reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
      <h2 className="accordion-header">
        <button className="accordion-button" onClick={goToDefendingsPage}>
          Your Defendings
        </button>
      </h2>
    </div>

          {/* Pocket: Graduated Students */}
          <div className="accordion-item">
            <h2 className="accordion-header">
    <button
      className={`accordion-button ${activePocket === 'graduatedStudents' ? '' : 'collapsed'}`}
      onClick={() => togglePocket('graduatedStudents')}
    >
      Graduated Students
    </button>
  </h2>
  <div className={`accordion-collapse collapse ${activePocket === 'graduatedStudents' ? 'show' : ''}`}>
    <div className="accordion-body">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const response = await httpClient.get(
              `/thesis-defendings/students?startDate=${startDate}&endDate=${endDate}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );
            setGraduatedStudents(response.data);
          } catch (error) {
            alert('Failed to fetch graduated students. Please try again later.');
          }
        }}
      >
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Fetch Graduated Students
        </button>
      </form>

      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Date of Graduation</th>
          </tr>
        </thead>
        <tbody>
          {graduatedStudents.length > 0 ? (
            graduatedStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.dateGraduated}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
</div>
      </div>
  );
}

export default TeacherDashboard;
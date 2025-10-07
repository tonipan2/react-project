import React, { useState, useEffect } from 'react';
import httpClient from './httpClient';
import { jwtDecode } from 'jwt-decode';

function DefendingPage({ userData }) {
    const [defendings, setDefendings] = useState([]);
    const [activePocket, setActivePocket] = useState(null);
    const [showDefendingForm, setShowDefendingForm] = useState(false);
    const [defendingDate, setDefendingDate] = useState('');
    const [selectedDefendingId, setSelectedDefendingId] = useState(null); // For linking theses
    const [theses, setTheses] = useState([]);
    const [filteredTheses, setFilteredTheses] = useState([]); // For storing filtered theses
    const [selectedThesisId, setSelectedThesisId] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [minGrade, setMinGrade] = useState(2); // Minimum grade input
    const [maxGrade, setMaxGrade] = useState(6); // Maximum grade input
    const [teachers, setTeachers] = useState([]); // Store teachers list
    const [graduatedCount, setGraduatedCount] = useState(null); // Store graduated students count
    const [studentsCount, setStudentsCount] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

  useEffect(() => {
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
          setTeacherId(response.data.id);
        } else {
          console.error('Teacher data is invalid:', response.data);
          alert('Failed to fetch valid teacher information.');
        }
      } catch (error) {
        console.error('Error fetching teacher ID:', error);
        alert('Failed to fetch teacher information. Please try again later.');
      }
    };
  
    const fetchTheses = async () => {
      try {
        const response = await httpClient.get('/thesis/fetch/all', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTheses(response.data);
      } catch (error) {
        alert('Failed to load theses. Please try again later.');
      }
    };

    const fetchTeachers = async () => {
        try {
          const response = await httpClient.get('/teacher/fetch/all', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setTeachers(response.data);
        } catch (error) {
          alert('Failed to load teachers. Please try again later.');
        }
      };
  
    fetchTeacherId();
    fetchTeachers();
    fetchTheses();
  }, [userData]);
  
  // Fetch defendings only after teacherId is set
  useEffect(() => {
    const fetchDefendings = async () => {
      if (!teacherId) return; // Wait for teacherId to be set
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
  
    fetchDefendings();
  }, [teacherId]); // Depend on teacherId
  
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
        setDefendings((prev) => [...prev, response.data]);
        setShowDefendingForm(false);
        setDefendingDate('');
        setSelectedDefendingId(response.data.id); // Store the ID of the newly created defending
      } else {
        alert('Failed to schedule defending. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while scheduling defending. Please try again later.');
    }
  };

  const togglePocket = (pocket) => {
    setActivePocket(activePocket === pocket ? null : pocket);
  };

  const handleAddThesisDefending = async () => {
    if (!selectedThesisId || !selectedDefendingId) {
      alert('Please select both a thesis and a defending.');
      return;
    }

    try {
      const response = await httpClient.post(
        `/thesis-defendings/add`,
        { thesisId: selectedThesisId, defendingId: selectedDefendingId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Thesis successfully added to defending!');
      } else {
        alert('Failed to add thesis to defending. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while adding the thesis. Please try again later.');
    }
  };

  const handleFilterThesesByGrade = async () => {
    if (!teacherId) {
      alert('Unable to fetch filtered theses as teacher ID is missing.');
      return;
    }

    try {
      const response = await httpClient.get(
        `/thesis/by-grade-range?minGrade=${minGrade}&maxGrade=${maxGrade}&teacherId=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setFilteredTheses(response.data);
    } catch (error) {
      alert('Failed to fetch theses by grade range. Please try again later.');
    }
  };

  const handleTeacherChange = async (teacherId) => {
    setTeacherId(teacherId);
    try {
      const response = await httpClient.get(
        `/thesis-defendings/students-graduated?teacherId=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setGraduatedCount(response.data); // Set the number of graduated students
    } catch (error) {
      alert('Failed to load graduated students count. Please try again later.');
    }
  };

  
  const handleFetchStudentsCount = async () => {
    try {
  
        const response = await httpClient.get(
            `/defending/average-students?startDate=${startDate}&endDate=${endDate}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
        );
      
      const data = await response.json();
      setStudentsCount(data)
    } catch (error) {
      console.error("Failed to fetch students count:", error);
      setStudentsCount(null);  // Handle the error case
    }
  };
  
  
  
  

  return (
<div className="container mt-5">
      <h1>Defendings Management</h1>

      {/* Pocket 1: Manage Defendings */}
      <div className="card mt-4">
        <div className="card-header">
          <button
            className={`accordion-button ${
              activePocket === "manageDefendings" ? "" : "collapsed"
            }`}
            onClick={() => togglePocket("manageDefendings")}
          >
            Manage Defendings
          </button>
        </div>
        {activePocket === "manageDefendings" && (
          <div className="card-body">
            <button
              className="btn btn-primary mb-3"
              onClick={() => setShowDefendingForm(!showDefendingForm)}
            >
              Schedule New Defending
            </button>

            {showDefendingForm && (
              <form onSubmit={handleAddDefending} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="dateDefending" className="form-label">
                    Defending Date
                  </label>
                  <input
                    type="date"
                    id="dateDefending"
                    className="form-control"
                    value={defendingDate}
                    onChange={(e) => setDefendingDate(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setShowDefendingForm(false)}
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="mt-4">
              <h2>Link Thesis to Defending</h2>
              <div className="mb-3">
                <label htmlFor="selectDefending" className="form-label">
                  Select Defending:
                </label>
                <select
                  id="selectDefending"
                  className="form-select"
                  value={selectedDefendingId || ""}
                  onChange={(e) => setSelectedDefendingId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Select a defending
                  </option>
                  {defendings.map((defending) => (
                    <option key={defending.id} value={defending.id}>
                      ID: {defending.id}, Date: {defending.dateDefending}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="selectThesis" className="form-label">
                  Select Thesis:
                </label>
                <select
                  id="selectThesis"
                  className="form-select"
                  value={selectedThesisId || ""}
                  onChange={(e) => setSelectedThesisId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Select a thesis
                  </option>
                  {theses.map((thesis) => (
                    <option key={thesis.id} value={thesis.id}>
                      ID: {thesis.id}, Name: {thesis.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAddThesisDefending}
              >
                Add Thesis to Defending
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pocket 2: Scheduled Defendings */}
      <div className="card mt-4">
        <div className="card-header">
          <button
            className={`accordion-button ${
              activePocket === "scheduledDefendings" ? "" : "collapsed"
            }`}
            onClick={() => togglePocket("scheduledDefendings")}
          >
            Scheduled Defendings
          </button>
        </div>
        {activePocket === "scheduledDefendings" && (
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date of Defending</th>
                </tr>
              </thead>
              <tbody>
                {defendings.length > 0 ? (
                  defendings.map((defending) => (
                    <tr key={defending.id}>
                      <td>{defending.id}</td>
                      <td>{defending.dateDefending}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No defendings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pocket 3: Filter Theses by Grade */}
      <div className="card mt-4">
        <div className="card-header">
          <button
            className={`accordion-button ${
              activePocket === "filterTheses" ? "" : "collapsed"
            }`}
            onClick={() => togglePocket("filterTheses")}
          >
            Filter Theses by Grade
          </button>
        </div>
        {activePocket === "filterTheses" && (
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="minGrade" className="form-label">
                  Minimum Grade
                </label>
                <input
                  type="number"
                  id="minGrade"
                  className="form-control"
                  value={minGrade}
                  onChange={(e) => setMinGrade(Number(e.target.value))}
                  min="2"
                  max="6"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="maxGrade" className="form-label">
                  Maximum Grade
                </label>
                <input
                  type="number"
                  id="maxGrade"
                  className="form-control"
                  value={maxGrade}
                  onChange={(e) => setMaxGrade(Number(e.target.value))}
                  min="2"
                  max="6"
                />
              </div>
            </div>
            <button
              className="btn btn-primary mb-3"
              onClick={handleFilterThesesByGrade}
            >
              Filter
            </button>

            {filteredTheses.length > 0 && (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Date Uploaded</th>
                    <th>Defending Grades</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTheses.map((thesis) => (
                    <tr key={thesis.id}>
                      <td>{thesis.id}</td>
                      <td>{thesis.name}</td>
                      <td>{thesis.dateUploaded}</td>
                      <td>
                        {thesis.thesisDefendings.length > 0 ? (
                          thesis.thesisDefendings.map((defending) => (
                            <div key={defending.id}>
                              <strong>ID:</strong> {defending.id}, <strong>Grade:</strong>{" "}
                              {defending.grade}
                            </div>
                          ))
                        ) : (
                          <em>No defendings</em>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Pocket 4: Teacher Selection */}
      <div className="card mt-4">
        <div className="card-header">
          <button
            className={`accordion-button ${
              activePocket === "teacherSelection" ? "" : "collapsed"
            }`}
            onClick={() => togglePocket("teacherSelection")}
          >
            Teacher Selection
          </button>
        </div>
        {activePocket === "teacherSelection" && (
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="teacherSelect" className="form-label">
                Select Teacher:
              </label>
              <select
                id="teacherSelect"
                className="form-select"
                onChange={(e) => handleTeacherChange(Number(e.target.value))}
              >
                <option value="" disabled>
                  Select a teacher
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.firstName} {teacher.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {graduatedCount !== null && (
              <div>
                <h3>Number of Graduated Students: {graduatedCount}</h3>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <button
            className={`accordion-button ${
              activePocket === "studentsByDate" ? "" : "collapsed"
            }`}
            onClick={() => togglePocket("studentsByDate")}
          >
            Students by Defending Date Range
          </button>
        </div>
        {activePocket === "studentsByDate" && (
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <label htmlFor="startDate" className="form-label">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="endDate" className="form-label">
                  End Date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={handleFetchStudentsCount}
            >
              Fetch Students Count
            </button>
            {studentsCount !== null && (
              <div className="mt-3">
                <h3>Number of Students: {studentsCount}</h3>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default DefendingPage;
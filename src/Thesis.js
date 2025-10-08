import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import httpClient from './httpClient';
import { jwtDecode } from 'jwt-decode';

function Thesis() {
  const navigate = useNavigate();
  const { applicationId } = useParams(); 
  const [thesisData, setThesisData] = useState({
    name: '',
    text: '',
    dateUploaded: '',
    applicationId: null,
  });

  useEffect(() => {
    if (applicationId) {
      setThesisData((prev) => ({ ...prev, applicationId: parseInt(applicationId, 10) }));
    } else {
      console.error('Application ID is missing from the URL.');
      alert('Application ID is missing. Please check the URL or try again.');
      navigate('/dashboard'); // Redirect to dashboard if applicationId is missing
    }
  }, [applicationId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setThesisData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!thesisData.applicationId) {
      alert('Application ID is missing. Please try again.');
      return;
    }

    try {
      const response = await httpClient.post('/thesis/add', thesisData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert('Thesis submitted successfully!');
        setThesisData({
          name: '',
          text: '',
          dateUploaded: '',
          applicationId: null,
        });
        navigate('/dashboard'); // Redirect to the dashboard after submission
      } else {
        alert('Failed to submit thesis. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting thesis:', error);
      alert('An error occurred while submitting the thesis. Please try again later.');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Submit a Thesis</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={thesisData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="text" className="form-label">Text</label>
          <textarea
            id="text"
            name="text"
            className="form-control"
            value={thesisData.text}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dateUploaded" className="form-label">
            Date Uploaded
          </label>
          <input
            type="date"
            className="form-control"
            id="dateUploaded"
            name="dateUploaded"
            value={thesisData.dateUploaded}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default Thesis;

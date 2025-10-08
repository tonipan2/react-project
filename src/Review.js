import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import httpClient from './httpClient';
import {jwtDecode} from 'jwt-decode';

function Review() {
  const { thesisId } = useParams(); 
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState(null);
  const [reviewData, setReviewData] = useState({
    text: '',
    dateUploaded: '',
    conclusion: '',
    teacherId: null, 
    thesisId: null, //We'll set later
  });

  useEffect(() => {
    // Fetch the teacher ID from the token
    const fetchTeacherId = async () => {
      try {
        const token = localStorage.getItem('token'); 
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
          setReviewData((prevData) => ({
            ...prevData,
            teacherId: response.data.id, // Set teacherId in review data
            thesisId: parseInt(thesisId, 10), // Set thesisId in review data
          }));
        } else {
          console.error('Teacher data is invalid:', response.data);
          alert('Failed to fetch valid teacher information.');
        }
      } catch (error) {
        console.error('Error fetching teacher ID:', error);
        alert('Failed to fetch teacher information. Please try again later.');
      }
    };

    fetchTeacherId();
  }, [thesisId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData((prevData) => ({
      ...prevData,
      [name]: name === 'conclusion' ? value === 'true' : value, 
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post('/review/add', reviewData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token to header
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert('Review submitted successfully!');
        navigate('/'); // Redirect to dashboard or another page
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting the review. Please try again later.');
    }
  };

  return (
    <div className="container mt-5">
      <h1>Submit Review</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="text" className="form-label">
            Review Text
          </label>
          <textarea
            className="form-control"
            id="text"
            name="text"
            value={reviewData.text}
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
            value={reviewData.dateUploaded}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
  <label htmlFor="conclusion" className="form-label">
    Conclusion
  </label>
  <select
    className="form-control"
    id="conclusion"
    name="conclusion"
    value={reviewData.conclusion}
    onChange={handleInputChange}
    required
  >
    <option value="">Select</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
</div>
        <button type="submit" className="btn btn-primary">
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default Review;

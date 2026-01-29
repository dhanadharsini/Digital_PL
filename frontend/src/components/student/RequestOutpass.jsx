import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './RequestOutpass.css';

const RequestOutpass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placeOfVisit, setPlaceOfVisit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!placeOfVisit.trim()) {
      setError('Please enter place of visit');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/student/outpass/request', {
        placeOfVisit: placeOfVisit.trim()
      });

      console.log('Outpass created:', response.data);
      alert('✅ Outpass created successfully! Your QR code is ready.');
      navigate('/student/outpass-history');
    } catch (err) {
      console.error('Error creating outpass:', err);
      setError(err.response?.data?.message || 'Failed to create outpass');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Request Outpass" />

        <div className="request-outpass-container">
          <div className="card">
            <h2>Request Outpass (4 Hours)</h2>
            <p className="info-text">
              Submit an outpass request for a 4-hour leave. A QR code will be generated immediately with all your details.
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="outpass-form-simple">
              
              <div className="student-info-display">
                <h3>Your Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{user?.name || 'Loading...'}</span>
                  </div>
                </div>
              </div>

              <div className="form-group-main">
                <label>Where are you going? <span className="required">*</span></label>
                <input
                  type="text"
                  value={placeOfVisit}
                  onChange={(e) => setPlaceOfVisit(e.target.value)}
                  placeholder="Enter place of visit (e.g., Library, City Mall, Hospital, Bank)"
                  required
                  autoFocus
                  className="place-input"
                />
              </div>

              <div className="info-box">
                <h4>⏱️ Important Information:</h4>
                <ul>
                  <li>Outpass is valid for <strong>4 hours</strong> from exit time</li>
                  <li>QR code will be generated with all your details automatically</li>
                  <li>Show the QR code to the warden when <strong>leaving</strong></li>
                  <li>Show the same QR code when <strong>returning</strong></li>
                  <li>Late returns will be recorded and may have consequences</li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={loading}
              >
                {loading ? '⏳ Creating Outpass...' : '🎫 Generate Outpass with QR Code'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestOutpass;
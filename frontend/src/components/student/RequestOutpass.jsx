import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout';
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
    <DashboardLayout title="Request Outpass" menuItems={menuItems}>
      <div className="request-outpass-container">
        <div className="card" style={{ padding: 'clamp(20px, 5vw, 28px)' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(16px, 4vw, 20px)',
            textAlign: 'center'
          }}>Request Outpass (4 Hours)</h2>
          <p className="info-text" style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            textAlign: 'center',
            marginBottom: 'clamp(16px, 4vw, 20px)'
          }}>
            Submit an outpass request for a 4-hour leave. A QR code will be generated immediately with all your details.
          </p>

          {error && (
            <div className="error-message" style={{
              marginBottom: 'clamp(16px, 4vw, 20px)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              padding: 'clamp(12px, 3vw, 16px)'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="outpass-form-simple">
            <div className="student-info-display" style={{
              marginBottom: 'clamp(20px, 5vw, 24px)',
              padding: 'clamp(16px, 4vw, 20px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
            }}>
              <h3 style={{ 
                fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                marginBottom: 'clamp(12px, 3vw, 16px)',
                textAlign: 'center',
                color: '#cbd5e1'
              }}>Your Details</h3>
              <div className="info-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(12px, 3vw, 16px)'
              }}>
                <div className="info-item">
                  <span className="info-label" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: '600'
                  }}>Name:</span>
                  <span className="info-value" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    wordBreak: 'break-word'
                  }}>{user?.name || 'Loading...'}</span>
                </div>
              </div>
            </div>

            <div className="form-group-main" style={{ marginTop: 'clamp(20px, 5vw, 24px)' }}>
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600',
                display: 'block'
              }}>
                Where are you going? <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={placeOfVisit}
                onChange={(e) => setPlaceOfVisit(e.target.value)}
                placeholder="Enter place of visit (e.g., Library, City Mall, Hospital, Bank)"
                required
                autoFocus
                className="place-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: 'clamp(12px, 3vw, 16px)',
                  width: '100%',
                  borderRadius: '8px',
                  border: '2px solid #334155'
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={loading}
              style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)',
                minHeight: '48px',
                width: '100%',
                marginTop: 'clamp(20px, 5vw, 24px)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner-small" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRight: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  ⏳ Creating Outpass...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎫 Generate Outpass with QR Code
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestOutpass;
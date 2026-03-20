import React, { useState, useEffect } from 'react';
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
  const [studentInfo, setStudentInfo] = useState({
    name: user?.name || '',
    regNo: 'Loading...',
    roomNo: 'Loading...'
  });

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await api.get('/student/details');
        const student = response.data;
        setStudentInfo({
          name: student.name,
          regNo: student.regNo,
          roomNo: student.roomNo
        });
      } catch (error) {
        console.error('Error fetching student info:', error);
        // Set fallback values
        setStudentInfo({
          name: user?.name || 'Student',
          regNo: 'N/A',
          roomNo: 'N/A'
        });
      }
    };

    fetchStudentInfo();
  }, [user?.name]);

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
        <div className="card" style={{
          padding: 'clamp(20px, 5vw, 32px)',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
          border: '1px solid #334155',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(16px, 4vw, 20px)',
            textAlign: 'center',
            color: '#e2e8f0',
            fontWeight: '700'
          }}>Request Outpass</h2>
          <p className="info-text" style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            textAlign: 'center',
            marginBottom: 'clamp(20px, 5vw, 24px)',
            color: '#94a3b8',
            lineHeight: '1.6'
          }}>
            Submit an outpass request for a 4-hour leave. A QR code will be generated immediately with all your details.
          </p>

          {error && (
            <div className="error-message" style={{
              marginBottom: 'clamp(16px, 4vw, 20px)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              padding: 'clamp(12px, 3vw, 16px)',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              fontWeight: '600',
              border: '1px solid #ef4444',
              textAlign: 'center'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="outpass-form-simple">
            <div className="student-info-display" style={{
              marginBottom: 'clamp(24px, 6vw, 28px)',
              padding: 'clamp(16px, 4vw, 20px)',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid #334155'
            }}>
              <h3 style={{ 
                fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                marginBottom: 'clamp(12px, 3vw, 16px)',
                textAlign: 'center',
                color: '#cbd5e1',
                fontWeight: '600'
              }}>Your Details</h3>
              <div className="info-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(12px, 3vw, 16px)'
              }}>
                <div className="info-item">
                  <span className="info-label" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Name:</span>
                  <span className="info-value" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    wordBreak: 'break-word',
                    color: '#e2e8f0',
                    fontWeight: '500'
                  }}>{studentInfo.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Reg No:</span>
                  <span className="info-value" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    wordBreak: 'break-word',
                    color: '#e2e8f0',
                    fontWeight: '500'
                  }}>{studentInfo.regNo}</span>
                </div>
                <div className="info-item">
                  <span className="info-label" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    fontWeight: '600',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Room No:</span>
                  <span className="info-value" style={{
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    wordBreak: 'break-word',
                    color: '#e2e8f0',
                    fontWeight: '500'
                  }}>{studentInfo.roomNo}</span>
                </div>
              </div>
            </div>

            <div className="form-group-main" style={{ marginTop: 'clamp(20px, 5vw, 24px)' }}>
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600',
                display: 'block',
                color: '#e2e8f0'
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
                  padding: 'clamp(14px, 3.5vw, 18px) clamp(16px, 4vw, 20px)',
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                  e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={loading}
              style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                padding: 'clamp(14px, 3.5vw, 18px) clamp(16px, 4vw, 24px)',
                minHeight: '52px',
                width: '100%',
                marginTop: 'clamp(24px, 6vw, 28px)',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: loading 
                  ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
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
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout';
import { api, BASE_URL } from '../../services/api';
import './OutpassQR.css';

const OutpassQR = () => {
  const { id } = useParams();
  const [outpass, setOutpass] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  useEffect(() => {
    fetchOutpass();
  }, [id]);

  const fetchOutpass = async () => {
    try {
      const response = await api.get('/student/outpass/active');
      setOutpass(response.data);
    } catch (error) {
      console.error('Error fetching outpass:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Outpass QR Code" menuItems={menuItems}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          color: '#e2e8f0'
        }}>
          Loading outpass...
        </div>
      </DashboardLayout>
    );
  }

  if (!outpass) {
    return (
      <DashboardLayout title="Outpass QR Code" menuItems={menuItems}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: 'clamp(20px, 5vw, 40px)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            color: '#dc2626',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>Outpass Not Found</h3>
          <p style={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            color: '#94a3b8'
          }}>This outpass may have been completed or does not exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Outpass QR Code" menuItems={menuItems}>
      <div className="outpass-qr-container">
        <div className="qr-card">
          <div className="qr-header">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(12px, 3vw, 16px)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {outpass.profilePhoto ? (
                <img
                  src={`${BASE_URL}${outpass.profilePhoto}`}
                  alt="Student"
                  style={{
                    width: 'clamp(48px, 8vw, 64px)',
                    height: 'clamp(48px, 8vw, 64px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                />
              ) : (
                <div style={{
                  width: 'clamp(48px, 8vw, 64px)',
                  height: 'clamp(48px, 8vw, 64px)',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(20px, 4vw, 26px)',
                  color: 'white',
                  fontWeight: 'bold',
                  border: '3px solid rgba(255,255,255,0.4)'
                }}>
                  {outpass.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  color: '#f1f5f9',
                  fontWeight: '700'
                }}>4-Hour Outpass</h2>
                <span className={`status-badge ${outpass.status}`} style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)'
                }}>
                  {outpass.status === 'active' ? 'Active' : 'Completed'}
                </span>
              </div>
            </div>
          </div>

          <div className="qr-code-section">
            <img
              src={outpass.qrCode}
              alt="Outpass QR Code"
              className="qr-code-image"
            />
            <p className="qr-instruction">
              Show this QR code to the warden when exiting and returning
            </p>
          </div>

          <div className="outpass-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{outpass.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Reg No</span>
                <span className="info-value">{outpass.regNo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{outpass.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Room No</span>
                <span className="info-value">{outpass.roomNo}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Place of Visit</span>
                <span className="info-value">{outpass.placeOfVisit}</span>
              </div>
            </div>

            {outpass.exitTime && (
              <div className="timing-info">
                <div className="timing-item">
                  <span className="timing-label">Exit Time</span>
                  <span className="timing-value">{formatDate(outpass.exitTime)}</span>
                </div>
                <div className="timing-item">
                  <span className="timing-label">Expected Return</span>
                  <span className="timing-value expected">{formatDate(outpass.expectedReturnTime)}</span>
                </div>
              </div>
            )}

            {!outpass.exitTime && (
              <div className="warning-box">
                <p>⚠️ Please show this QR code to the warden to mark your exit</p>
              </div>
            )}

            {outpass.exitTime && !outpass.actualReturnTime && (
              <div className="warning-box">
                <p>⏰ Remember to return within 4 hours and show this QR code to the warden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OutpassQR;
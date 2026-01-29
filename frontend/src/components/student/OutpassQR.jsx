import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
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
      <div className="dashboard-container">
        <Sidebar menuItems={menuItems} />
        <div className="main-content">
          <Navbar title="Outpass QR Code" />
          <div className="loading">Loading outpass...</div>
        </div>
      </div>
    );
  }

  if (!outpass) {
    return (
      <div className="dashboard-container">
        <Sidebar menuItems={menuItems} />
        <div className="main-content">
          <Navbar title="Outpass QR Code" />
          <div className="error-state">
            <h3>Outpass Not Found</h3>
            <p>This outpass may have been completed or does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Outpass QR Code" />

        <div className="outpass-qr-container">
          <div className="qr-card">
            <div className="qr-header">
              <h2>4-Hour Outpass</h2>
              <span className={`status-badge ${outpass.status}`}>
                {outpass.status === 'active' ? 'Active' : 'Completed'}
              </span>
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
      </div>
    </div>
  );
};

export default OutpassQR;
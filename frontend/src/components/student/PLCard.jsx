import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api, BASE_URL } from '../../services/api';
import { generatePLPDF } from '../../utils/pdfGenerator';

const PLCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plData, setPlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  useEffect(() => {
    fetchPLData();
  }, [id]);

  const fetchPLData = async () => {
    try {
      const response = await api.get(`/student/pl-card/${id}`);
      setPlData(response.data);
    } catch (error) {
      console.error('Error fetching PL data:', error);
      setError(error.response?.data?.message || 'Failed to load permission letter');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!plData) return;

    setDownloading(true);
    try {
      await generatePLPDF(plData);
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        {/* Hamburger Button */}
        <button
          className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        ></div>

        <Sidebar
          menuItems={menuItems}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <div className="main-content">
          <Navbar title="Permission Letter Card" />
          <div className="loading-spinner" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'var(--card-text, #e2e8f0)'
          }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--card-border, #334155)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            Loading permission letter...
          </div>
          {/* Add keyframe animation */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        {/* Hamburger Button */}
        <button
          className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        ></div>

        <Sidebar
          menuItems={menuItems}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        <div className="main-content">
          <Navbar title="Permission Letter Card" />
          <div className="card">
            <div className="alert alert-error">
              <h3>⚠️ Cannot Display PL Card</h3>
              <p>{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/student/pl-history')}
                style={{ marginTop: '20px' }}
              >
                Back to PL History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hamburger Button */}
      <button
        className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      <Sidebar
        menuItems={menuItems}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="main-content">
        <Navbar title="Permission Letter Card" />

        {plData ? (
          <div className="pl-card-container">
            {/* Add CSS variables for theme support */}
            <style>{`
              :root {
                --pl-card-bg: #ffffff;
                --pl-card-border: #e5e7eb;
                --pl-card-text: #1f2937;
                --pl-header-bg: #f8fafc;
                --pl-header-text: #1e293b;
                --pl-label-color: #6b7280;
                --pl-value-color: #1f2937;
                --pl-qr-border: #e5e7eb;
                --pl-warning-bg: #fef3c7;
                --pl-warning-border: #f59e0b;
                --pl-warning-text: #92400e;
                --pl-divider: #e5e7eb;
              }
              .dark-mode {
                --pl-card-bg: #1e293b;
                --pl-card-border: #334155;
                --pl-card-text: #f1f5f9;
                --pl-header-bg: #334155;
                --pl-header-text: #f1f5f9;
                --pl-label-color: #94a3b8;
                --pl-value-color: #f1f5f9;
                --pl-qr-border: #334155;
                --pl-warning-bg: #451a03;
                --pl-warning-border: #d97706;
                --pl-warning-text: #fef3c7;
                --pl-divider: #334155;
              }
              .pl-card {
                background: var(--pl-card-bg);
                border: 1px solid var(--pl-card-border);
                color: var(--pl-card-text);
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              .pl-card-header {
                background: var(--pl-header-bg);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid var(--pl-card-border);
              }
              .pl-card-header h2 {
                color: var(--pl-header-text);
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 700;
              }
              .pl-card-header p {
                color: var(--pl-label-color);
                margin: 0;
                font-size: 14px;
              }
              .pl-details {
                background: var(--pl-card-bg);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid var(--pl-card-border);
                margin-bottom: 20px;
              }
              .pl-detail-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid var(--pl-divider);
              }
              .pl-detail-row:last-child {
                border-bottom: none;
              }
              .pl-detail-row strong {
                color: var(--pl-label-color);
                font-weight: 600;
                font-size: 14px;
              }
              .pl-detail-row span {
                color: var(--pl-value-color);
                font-weight: 500;
                font-size: 14px;
                text-align: right;
              }
              .qr-code-container {
                background: var(--pl-card-bg);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid var(--pl-card-border);
                text-align: center;
              }
              .qr-code-container h3 {
                color: var(--pl-header-text);
                margin: 0 0 16px 0;
                font-size: 18px;
                font-weight: 600;
              }
              .qr-code-container img {
                border: 4px solid var(--pl-qr-border);
                border-radius: 8px;
                padding: 12px;
                background: white;
                max-width: 200px;
                height: auto;
              }
              .qr-code-container p {
                color: var(--pl-label-color);
                font-size: 14px;
                margin: 12px 0 0 0;
              }
              @media (max-width: 768px) {
                .pl-detail-row {
                  flex-direction: column;
                  gap: 4px;
                }
                .pl-detail-row span {
                  text-align: left;
                }
              }
            `}</style>
            <div className="pl-card">
              <div className="pl-card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2>Permission Letter</h2>
                    <p>Hostel Management System</p>
                  </div>
                  {plData.profilePhoto ? (
                    <img
                      src={`${BASE_URL}${plData.profilePhoto}`}
                      alt="Student"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--pl-card-border)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {plData.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                </div>
              </div>

              <div className="pl-details">
                <div className="pl-detail-row">
                  <strong>Name:</strong>
                  <span>{plData.name}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Registration No:</strong>
                  <span>{plData.regNo}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Hostel:</strong>
                  <span>{plData.hostelName}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Room No:</strong>
                  <span>{plData.roomNo}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Place of Visit:</strong>
                  <span>{plData.placeOfVisit}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Reason:</strong>
                  <span>{plData.reasonOfVisit}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Departure:</strong>
                  <span>{new Date(plData.departureDateTime).toLocaleString()}</span>
                </div>
                <div className="pl-detail-row">
                  <strong>Expected Return:</strong>
                  <span>{new Date(plData.arrivalDateTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="qr-code-container">
                <h3>QR Code</h3>
                <img src={plData.qrCode} alt="QR Code" />
                <p>Show this QR code to warden at entry/exit</p>
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: 'var(--pl-warning-bg, #fff3cd)',
                  borderRadius: '5px',
                  border: '1px solid var(--pl-warning-border, #ffc107)'
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--pl-warning-text, #856404)', margin: 0 }}>
                    ⚠️ <strong>Important:</strong> This QR code can only be used once for exit and once for entry. After returning to hostel, this PL will be marked as expired.
                  </p>
                </div>
              </div>

              {/* Download Button at Bottom */}
              <div style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px solid var(--pl-divider, #ecf0f1)',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  className="btn"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: downloading
                      ? '#95a5a6'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: downloading
                      ? 'none'
                      : '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if (!downloading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!downloading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  {downloading ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></span>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Download as PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Add keyframe animation */}
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <div className="card">
            <p>Permission letter not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLCard;
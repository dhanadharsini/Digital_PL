import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import { generatePLPDF } from '../../utils/pdfGenerator';

const PLCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plData, setPlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

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

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar menuItems={menuItems} />
        <div className="main-content">
          <Navbar title="Permission Letter Card" />
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar menuItems={menuItems} />
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
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Permission Letter Card" />
        
        {plData ? (
          <div className="pl-card-container">
            <div className="pl-card">
              <div className="pl-card-header">
                <h2>Permission Letter</h2>
                <p>Hostel Management System</p>
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
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Show this QR code to warden at entry/exit
                </p>
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '5px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{ fontSize: '12px', color: '#856404', margin: 0 }}>
                    ⚠️ <strong>Important:</strong> This QR code can only be used once for exit and once for entry. After returning to hostel, this PL will be marked as expired.
                  </p>
                </div>
              </div>

              {/* Download Button at Bottom */}
              <div style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px solid #ecf0f1',
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
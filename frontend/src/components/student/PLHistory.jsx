import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import { generatePLPDF } from '../../utils/pdfGenerator';

const PLHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${day}/${month}/${year}, ${displayHours}:${minutes} ${period}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/student/pl-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (request) => {
    setDownloadingId(request._id);
    try {
      await generatePLPDF(request);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        className: 'status-pending',
        style: {}
      },
      'parent-approved': {
        className: 'status-parent-approved',
        style: {}
      },
      approved: {
        className: 'status-approved',
        style: {}
      },
      rejected: {
        className: 'status-rejected',
        style: {}
      },
      expired: {
        className: 'status-badge',
        style: {
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-block',
          textTransform: 'uppercase'
        }
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`status-badge ${config.className}`} style={config.style}>
        {status.toUpperCase().replace('-', ' ')}
      </span>
    );
  };

  const viewPLCard = (id) => {
    navigate(`/student/pl-card/${id}`);
  };

  const canViewPLCard = (request) => {
    if (request.status !== 'approved') {
      return false;
    }

    const currentDateTime = new Date();
    const arrivalDateTime = new Date(request.arrivalDateTime);
    
    if (arrivalDateTime < currentDateTime) {
      return false;
    }

    if (request.isFullyUsed) {
      return false;
    }

    return true;
  };

  const canDownloadPDF = (request) => {
    // Only show download for approved PLs that are NOT expired or completed
    if (request.status !== 'approved') {
      return false;
    }

    // Check if QR code exists
    if (!request.qrCode) {
      return false;
    }

    // Check if PL has expired (arrival date passed)
    const currentDateTime = new Date();
    const arrivalDateTime = new Date(request.arrivalDateTime);
    
    if (arrivalDateTime < currentDateTime) {
      return false; // Don't show download for expired PLs
    }

    // Check if fully used
    if (request.isFullyUsed) {
      return false; // Don't show download for completed PLs
    }

    return true; // Only active approved PLs can download
  };

  const getActionButtons = (request) => {
    const hasViewButton = canViewPLCard(request);
    const hasPDFButton = canDownloadPDF(request);
    
    if (!hasViewButton && !hasPDFButton) {
      return <span style={{ color: '#999' }}>-</span>;
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        justifyContent: 'flex-start',
        alignItems: 'center'
      }}>
        {hasViewButton && (
          <button 
            className="btn btn-primary"
            onClick={() => viewPLCard(request._id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            View PL Card
          </button>
        )}
        
        {hasPDFButton && (
          <button 
            className="btn"
            onClick={() => handleDownloadPDF(request)}
            disabled={downloadingId === request._id}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: downloadingId === request._id ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: downloadingId === request._id ? 0.6 : 1,
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              if (downloadingId !== request._id) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {downloadingId === request._id ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>PDF</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const getDisplayStatus = (request) => {
    if (request.status === 'approved') {
      const currentDateTime = new Date();
      const arrivalDateTime = new Date(request.arrivalDateTime);
      
      if (arrivalDateTime < currentDateTime) {
        return 'expired';
      }
      
      if (request.isFullyUsed) {
        return 'completed';
      }
    }
    
    return request.status;
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Permission Letter History" />
        
        {/* Add keyframe animation for spinner */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Place of Visit</th>
                    <th>Reason</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        No permission letters found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.placeOfVisit}</td>
                        <td>{request.reasonOfVisit}</td>
                        <td>{formatDateTime(request.departureDateTime)}</td>
                        <td>{formatDateTime(request.arrivalDateTime)}</td>
                        <td>{getStatusBadge(getDisplayStatus(request))}</td>
                        <td>
                          {getActionButtons(request)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Status Guide</h3>
          <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge status-pending">PENDING</span>
              <span>Waiting for parent or warden approval</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge status-parent-approved">PARENT APPROVED</span>
              <span>Approved by parent, waiting for warden</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge status-approved">APPROVED</span>
              <span>Fully approved - you can view and download your PL card until arrival time</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge status-rejected">REJECTED</span>
              <span>Request was rejected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge" style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
                textTransform: 'uppercase'
              }}>EXPIRED</span>
              <span>Arrival time has passed - No actions available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PLHistory;
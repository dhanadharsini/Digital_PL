import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import { generateOutpassPDF } from '../../utils/pdfGenerator';
import './OutpassHistory.css';

const OutpassHistory = () => {
  const navigate = useNavigate();
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  useEffect(() => {
    fetchOutpassHistory();
  }, []);

  const fetchOutpassHistory = async () => {
    try {
      const response = await api.get('/student/outpass/history');
      setOutpasses(response.data);
    } catch (error) {
      console.error('Error fetching outpass history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOutpassQR = (outpass) => {
    navigate(`/student/outpass-qr/${outpass._id}`);
  };

  const handleDownloadPDF = async (outpass) => {
    setDownloadingId(outpass._id);
    try {
      await generateOutpassPDF(outpass);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
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

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Outpass History" />

        <div className="outpass-history-container">
          {loading ? (
            <div className="loading">Loading outpass history...</div>
          ) : outpasses.length === 0 ? (
            <div className="empty-state">
              <h3>No Outpass History</h3>
              <p>You haven't requested any outpasses yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/student/request-outpass')}
              >
                Request Outpass
              </button>
            </div>
          ) : (
            <div className="outpass-list">
              {outpasses.map((outpass) => (
                <div key={outpass._id} className={`outpass-card ${outpass.status}`}>
                  <div className="outpass-header">
                    <div>
                      <h3>{outpass.placeOfVisit}</h3>
                      <span className="reg-no">{outpass.regNo}</span>
                    </div>
                    <span className={`status-badge ${outpass.status}`}>
                      {outpass.status === 'active' ? 'Active' : 
                       outpass.status === 'completed' ? 'Completed' : 'Delayed'}
                    </span>
                  </div>

                  <div className="outpass-details">
                    <div className="detail-row">
                      <span className="label">Room No:</span>
                      <span className="value">{outpass.roomNo}</span>
                    </div>

                    {outpass.exitTime && (
                      <>
                        <div className="detail-row">
                          <span className="label">Exit Time:</span>
                          <span className="value">{formatDate(outpass.exitTime)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Expected Return:</span>
                          <span className="value">{formatDate(outpass.expectedReturnTime)}</span>
                        </div>
                      </>
                    )}

                    {outpass.actualReturnTime && (
                      <div className="detail-row">
                        <span className="label">Actual Return:</span>
                        <span className="value">{formatDate(outpass.actualReturnTime)}</span>
                      </div>
                    )}

                    {outpass.isDelayed && (
                      <div className="detail-row delay-info">
                        <span className="label">⚠️ Delayed By:</span>
                        <span className="value delay">{formatDuration(outpass.delayDuration)}</span>
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(outpass.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons - Only show for ACTIVE outpasses */}
                  {outpass.status === 'active' && (
                    <div className="outpass-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => viewOutpassQR(outpass)}
                      >
                        View QR Code
                      </button>
                      
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleDownloadPDF(outpass)}
                        disabled={downloadingId === outpass._id}
                      >
                        {downloadingId === outpass._id ? (
                          <>
                            <span className="spinner-small"></span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              style={{ marginRight: '6px' }}
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutpassHistory;
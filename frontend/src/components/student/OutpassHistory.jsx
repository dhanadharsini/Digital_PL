import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout';
import { api } from '../../services/api';
import { generateOutpassPDF } from '../../utils/pdfGenerator';
import './OutpassHistory.css';

const OutpassHistory = () => {
  const navigate = useNavigate();
  const [outpasses, setOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

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
    setRefreshing(true);
    try {
      const response = await api.get('/student/outpass/history');
      setOutpasses(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching outpass history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    <DashboardLayout title="Outpass History" menuItems={menuItems}>
      <div className="outpass-history-container">
        <div className="history-header-actions" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(20px, 5vw, 24px)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button
            className={`btn btn-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={fetchOutpassHistory}
            disabled={refreshing}
            style={{
              width: 'auto',
              padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              minHeight: '40px'
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={refreshing ? 'spin' : ''}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {loading ? (
          <div className="loading" style={{
            textAlign: 'center',
            padding: 'clamp(40px, 10vw, 60px)',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
          }}>Loading outpass history...</div>
        ) : outpasses.length === 0 ? (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: 'clamp(40px, 10vw, 60px)',
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            borderRadius: '12px',
            color: '#e2e8f0'
          }}>
            <h3 style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              marginBottom: 'clamp(12px, 3vw, 16px)'
            }}>No Outpass History</h3>
            <p style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: 'clamp(20px, 5vw, 24px)'
            }}>You haven't requested any outpasses yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/student/request-outpass')}
              style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                padding: 'clamp(12px, 3vw, 14px) clamp(16px, 4vw, 24px)',
                minHeight: '48px'
              }}
            >
              Request Outpass
            </button>
          </div>
        ) : (
          <div className="outpass-list" style={{
            display: 'grid',
            gap: 'clamp(16px, 4vw, 20px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {outpasses.map((outpass) => (
              <div key={outpass._id} className={`outpass-card ${outpass.status}`} style={{
                padding: 'clamp(16px, 4vw, 20px)',
                borderRadius: '12px',
                border: '1px solid #334155',
                background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
              }}>
                <div className="outpass-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'clamp(12px, 3vw, 16px)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <h3 style={{ 
                      fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                      marginBottom: '4px',
                      color: '#e2e8f0'
                    }}>{outpass.placeOfVisit}</h3>
                    <span className="reg-no" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      color: '#94a3b8'
                    }}>{outpass.regNo}</span>
                  </div>
                  <span className={`status-badge ${outpass.status}`} style={{
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    padding: '4px 8px'
                  }}>
                    {outpass.status === 'active' ? 'Active' :
                      outpass.status === 'completed' ? 'Completed' : 'Delayed'}
                  </span>
                </div>

                <div className="outpass-details" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 2vw, 12px)'
                }}>
                  <div className="detail-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className="label" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>Room No:</span>
                    <span className="value" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      color: '#e2e8f0',
                      fontWeight: '600'
                    }}>{outpass.roomNo}</span>
                  </div>

                  {outpass.exitTime && (
                    <>
                      <div className="detail-row" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span className="label" style={{
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          color: '#94a3b8',
                          fontWeight: '500'
                        }}>Exit Time:</span>
                        <span className="value" style={{
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          color: '#e2e8f0',
                          fontWeight: '600'
                        }}>{formatDate(outpass.exitTime)}</span>
                      </div>
                      <div className="detail-row" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span className="label" style={{
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          color: '#94a3b8',
                          fontWeight: '500'
                        }}>Expected Return:</span>
                        <span className="value" style={{
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                          color: '#e2e8f0',
                          fontWeight: '600'
                        }}>{formatDate(outpass.expectedReturnTime)}</span>
                      </div>
                    </>
                  )}

                  {outpass.actualReturnTime && (
                    <div className="detail-row" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span className="label" style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        color: '#94a3b8',
                        fontWeight: '500'
                      }}>Actual Return:</span>
                      <span className="value" style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        color: '#e2e8f0',
                        fontWeight: '600'
                      }}>{formatDate(outpass.actualReturnTime)}</span>
                    </div>
                  )}

                  {outpass.isDelayed && (
                    <div className="detail-row delay-info" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '8px',
                      borderRadius: '6px'
                    }}>
                      <span className="label" style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        color: '#ef4444',
                        fontWeight: '600'
                      }}>⚠️ Delayed By:</span>
                      <span className="value delay" style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        color: '#ef4444',
                        fontWeight: '700'
                      }}>{formatDuration(outpass.delayDuration)}</span>
                    </div>
                  )}

                  <div className="detail-row" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className="label" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>Created:</span>
                    <span className="value" style={{
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                      color: '#e2e8f0',
                      fontWeight: '600'
                    }}>{formatDate(outpass.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons - Only show for ACTIVE outpasses */}
                {outpass.status === 'active' && (
                  <div className="outpass-actions" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(8px, 2vw, 12px)',
                    marginTop: 'clamp(16px, 4vw, 20px)'
                  }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => viewOutpassQR(outpass)}
                      style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                        minHeight: '44px',
                        width: '100%'
                      }}
                    >
                      View QR Code
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownloadPDF(outpass)}
                      disabled={downloadingId === outpass._id}
                      style={{
                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                        minHeight: '44px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {downloadingId === outpass._id ? (
                        <>
                          <span className="spinner-small" style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid #ffffff',
                            borderTop: '2px solid transparent',
                            borderRight: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }}></span>
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
    </DashboardLayout>
  );
};

export default OutpassHistory;
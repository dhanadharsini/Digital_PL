import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/warden/pending-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.placeOfVisit.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.regNo.localeCompare(b.regNo, undefined, { numeric: true }));

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        // FIXED: Changed from /approve-request/ to /approve/
        const response = await api.post(`/warden/approve/${id}`);
        console.log('Approve response:', response.data);

        fetchRequests(); // Refresh the list
        alert('Request approved successfully!');
      } catch (error) {
        console.error('Approve error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to approve request';
        alert(errorMsg);
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please provide reason for rejection:');
    if (reason) {
      try {
        // FIXED: Changed from /reject-request/ to /reject/
        const response = await api.post(`/warden/reject/${id}`, { reason });
        console.log('Reject response:', response.data);

        fetchRequests(); // Refresh the list
        alert('Request rejected successfully!');
      } catch (error) {
        console.error('Reject error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to reject request';
        alert(errorMsg);
      }
    }
  };

   const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Reports', path: '/warden/reports' }
  ];

  return (
    <DashboardLayout title="Pending PL Requests" menuItems={menuItems}>
      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        :root {
          --card-bg: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          --card-border: #334155;
          --card-text: #e2e8f0;
          --table-border: #334155;
          --header-bg: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
          --input-bg: #0f172a;
        }
        .light-mode {
          --card-bg: #ffffff;
          --card-border: #e5e7eb;
          --card-text: #1f2937;
          --table-border: #e5e7eb;
          --header-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          --input-bg: #f9fafb;
        }
      `}</style>
      <div className="card" style={{
        padding: 'clamp(16px, 4vw, 24px)',
        borderRadius: '12px',
        background: 'var(--card-bg, linear-gradient(135deg, #334155 0%, #1e293b 100%))',
        border: '1px solid var(--card-border, #334155)',
        color: 'var(--card-text, #e2e8f0)'
      }}>
        <div className="card-header-actions" style={{ 
          marginBottom: 'clamp(20px, 5vw, 24px)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 'clamp(12px, 3vw, 15px)',
          padding: '0 4px'
        }}>
          <h2 style={{ 
            margin: 0,
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            textAlign: 'left',
            flex: 1,
            minWidth: '200px',
            color: 'var(--card-text, #e2e8f0)',
            fontWeight: '700'
          }}>Pending Lists</h2>
          <div className="search-box" style={{ 
            width: '100%', 
            maxWidth: 'clamp(250px, 40vw, 300px)',
            flexShrink: 0
          }}>
            <input
              type="text"
              placeholder="Search by name, reg no or place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--card-border, #334155)',
                width: '100%',
                fontSize: '16px', /* Prevents zoom on iOS */
                backgroundColor: 'var(--input-bg, #0f172a)',
                color: 'var(--card-text, #e2e8f0)'
              }}
            />
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: 'clamp(40px, 10vw, 60px)',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            color: 'var(--card-text, #e2e8f0)'
          }}>
            <div className="spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--card-border, #334155)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <div style={{
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Loading pending requests...
            </div>
            <div style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#94a3b8',
              textAlign: 'center'
            }}>
              Please wait while we fetch pending requests
            </div>
          </div>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--card-text, #666)' }}>
            No pending requests
          </p>
        ) : (
          <div className="table-container" style={{
            overflowX: 'auto',
            borderRadius: '8px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--header-bg, linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%))',
                  color: 'white'
                }}>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Student Name</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Reg No</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Room No</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Place of Visit</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Reason</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Departure</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Arrival</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request._id} style={{
                    borderBottom: '1px solid var(--card-border, #334155)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500'
                    }}>{request.name}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500'
                    }}>{request.regNo}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500'
                    }}>{request.roomNo}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500'
                    }}>{request.placeOfVisit}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500'
                    }}>{request.reasonOfVisit}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500',
                      fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)'
                    }}>{new Date(request.departureDateTime).toLocaleString()}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text, #e2e8f0)',
                      fontWeight: '500',
                      fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)'
                    }}>{new Date(request.arrivalDateTime).toLocaleString()}</td>
                    <td style={{
                      padding: 'clamp(8px, 2vw, 12px)'
                    }}>
                      <div className="action-buttons" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(6px, 1.5vw, 8px)',
                        minWidth: 'clamp(100px, 20vw, 120px)'
                      }}>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request._id)}
                          style={{
                            fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                            minHeight: 'clamp(36px, 8vw, 40px)',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request._id)}
                          style={{
                            fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                            minHeight: 'clamp(36px, 8vw, 40px)',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PendingRequests;
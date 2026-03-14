import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const PLRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // OTP Modal State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [currentPLId, setCurrentPLId] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/parent/pending-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Get rejection reason first
  const initiateReject = async (id) => {
    const reason = window.prompt('Please provide reason for rejection:');
    if (reason && reason.trim()) {
      // Store rejection reason temporarily
      sessionStorage.setItem('rejectionReason', reason);
      // Proceed to OTP
      handleSendOTP(id, 'reject');
    }
  };

  // Step 2: Send OTP
  const handleSendOTP = async (plId, action) => {
    setOtpLoading(true);
    setOtpError('');
    setMessage('');
    setCurrentPLId(plId);
    setCurrentAction(action);
    
    try {
      const response = await api.post('/parent/send-otp', { plId, action });
      setOtpSent(true);
      setShowOTPModal(true);
      setMessage(response.data.message || 'OTP sent to your registered phone number');
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Verify OTP and perform action
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyLoading(true);
    setOtpError('');

    try {
      const response = await api.post('/parent/verify-otp', {
        plId: currentPLId,
        action: currentAction,
        otp
      });

      // If action is reject, send the rejection reason
      if (currentAction === 'reject') {
        const reason = sessionStorage.getItem('rejectionReason');
        await api.post(`/parent/reject-request/${currentPLId}`, { reason });
        sessionStorage.removeItem('rejectionReason');
      }

      setMessage(response.data.message || 'Action completed successfully');
      setShowOTPModal(false);
      setOtp('');
      setOtpSent(false);
      fetchRequests();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setVerifyLoading(false);
    }
  };

  const closeOTPModal = () => {
    setShowOTPModal(false);
    setOtp('');
    setOtpSent(false);
    setOtpError('');
    setCurrentPLId(null);
    setCurrentAction(null);
    sessionStorage.removeItem('rejectionReason');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/parent' },
    { label: 'PL Requests', path: '/parent/pl-requests' },
    { label: 'Request History', path: '/parent/request-history' }
  ];

  return (
    <DashboardLayout title="Pending PL Requests" menuItems={menuItems}>
      <div className="card">
        {message && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#d1fae5', 
            color: '#065f46', 
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ {message}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No pending requests
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg No</th>
                  <th>Place of Visit</th>
                  <th>Reason</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.name}</td>
                    <td>{request.regNo}</td>
                    <td>{request.placeOfVisit}</td>
                    <td>{request.reasonOfVisit}</td>
                    <td>{new Date(request.departureDateTime).toLocaleString()}</td>
                    <td>{new Date(request.arrivalDateTime).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-success"
                          onClick={() => handleSendOTP(request._id, 'approve')}
                          disabled={otpLoading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => initiateReject(request._id)}
                          disabled={otpLoading}
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

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="modal-overlay" onClick={closeOTPModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button 
              className="close-btn" 
              onClick={closeOTPModal}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#666' }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px'
              }}>
                🔐
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                OTP Verification
              </h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Enter the 6-digit code sent to your registered phone number
              </p>

              {otpError && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#fee2e2', 
                  color: '#991b1b', 
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  ⚠️ {otpError}
                </div>
              )}

              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '20px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: 'bold',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />

              {!otpSent ? (
                <button
                  onClick={() => handleSendOTP(currentPLId, currentAction)}
                  disabled={otpLoading}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: otpLoading ? 'not-allowed' : 'pointer',
                    opacity: otpLoading ? 0.6 : 1
                  }}
                >
                  {otpLoading ? 'Sending OTP...' : 'Resend OTP'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading || otp.length !== 6}
                    style={{
                      width: '100%',
                      padding: '15px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: verifyLoading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                      opacity: verifyLoading || otp.length !== 6 ? 0.6 : 1,
                      marginBottom: '10px'
                    }}
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify & Confirm'}
                  </button>

                  <button
                    onClick={closeOTPModal}
                    style={{
                      width: '100%',
                      padding: '15px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}

              <p style={{ 
                marginTop: '20px', 
                fontSize: '12px', 
                color: '#9ca3af',
                lineHeight: '1.6'
              }}>
                🔒 This OTP expires in 5 minutes. Do not share this code with anyone.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PLRequests;

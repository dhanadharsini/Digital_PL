import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Attendance', path: '/warden/attendance' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

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

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Pending PL Requests" />
        
        <div className="card">
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
                    <th>Room No</th>
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
                      <td>{request.roomNo}</td>
                      <td>{request.placeOfVisit}</td>
                      <td>{request.reasonOfVisit}</td>
                      <td>{new Date(request.departureDateTime).toLocaleString()}</td>
                      <td>{new Date(request.arrivalDateTime).toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-success"
                            onClick={() => handleApprove(request._id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleReject(request._id)}
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
      </div>
    </div>
  );
};

export default PendingRequests;
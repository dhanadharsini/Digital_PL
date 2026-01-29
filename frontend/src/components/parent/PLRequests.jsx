import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const PLRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { label: 'Dashboard', path: '/parent' },
    { label: 'PL Requests', path: '/parent/pl-requests' },
    { label: 'Request History', path: '/parent/request-history' }
  ];

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

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        await api.post(`/parent/approve-request/${id}`);
        fetchRequests();
        alert('Request approved successfully!');
      } catch (error) {
        alert('Failed to approve request');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please provide reason for rejection:');
    if (reason) {
      try {
        await api.post(`/parent/reject-request/${id}`, { reason });
        fetchRequests();
        alert('Request rejected successfully!');
      } catch (error) {
        alert('Failed to reject request');
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
            <p>No pending requests</p>
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

export default PLRequests;
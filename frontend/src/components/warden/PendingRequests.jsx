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
      <div className="card">
        <div className="card-header-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0 }}>Pending Lists</h2>
          <div className="search-box" style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by name, reg no or place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                width: '100%'
              }}
            />
          </div>
        </div>
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
                {filteredRequests.map((request) => (
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
    </DashboardLayout>
  );
};

export default PendingRequests;
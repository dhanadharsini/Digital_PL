import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const response = await api.get('/parent/request-history');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      'parent-approved': 'status-parent-approved',
      approved: 'status-approved',
      rejected: 'status-rejected',
      expired: 'status-expired',
      completed: 'status-completed'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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
        <Navbar title="Request History" />
        
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
                    <th>Student Name</th>
                    <th>Reg No</th>
                    <th>Place of Visit</th>
                    <th>Reason</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Status</th>
                    <th>Your Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.name}</td>
                      <td>{request.regNo}</td>
                      <td>{request.placeOfVisit}</td>
                      <td>{request.reasonOfVisit}</td>
                      <td>{formatDateTime(request.departureDateTime)}</td>
                      <td>{formatDateTime(request.arrivalDateTime)}</td>
                      <td>{getStatusBadge(getDisplayStatus(request))}</td>
                      <td>{getStatusBadge(request.parentStatus)}</td>
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

export default RequestHistory;
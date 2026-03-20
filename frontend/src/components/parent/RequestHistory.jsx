import React, { useState, useEffect } from 'react';
import DashboardLayout from '../common/DashboardLayout';
import { api } from '../../services/api';

const RequestHistory = () => {
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

  return (
    <DashboardLayout title="Request History" menuItems={menuItems}>
      <div className="card">
        <h2 style={{ 
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          marginBottom: 'clamp(16px, 4vw, 20px)',
          textAlign: 'center'
        }}>Permission Letter Request History</h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Student Name</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Reg No</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Place of Visit</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Reason</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Departure</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Arrival</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Status</th>
                  <th style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>Your Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{request.name}</td>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{request.regNo}</td>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{request.placeOfVisit}</td>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{request.reasonOfVisit}</td>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{formatDateTime(request.departureDateTime)}</td>
                    <td style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>{formatDateTime(request.arrivalDateTime)}</td>
                    <td>{getStatusBadge(getDisplayStatus(request))}</td>
                    <td>{getStatusBadge(request.parentStatus)}</td>
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

export default RequestHistory;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/parent/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/parent' },
    { label: 'PL Requests', path: '/parent/pl-requests' },
    { label: 'Request History', path: '/parent/request-history' }
  ];

  return (
    <DashboardLayout title="Parent Dashboard" menuItems={menuItems}>
      <div className="welcome-message">
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>Welcome, {user?.name}!</h1>
        <p style={{ 
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          textAlign: 'center',
          margin: 0
        }}>Monitor your child's permission letter requests</p>
      </div>

      <div className="stats-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'clamp(12px, 3vw, 24px)',
        marginBottom: 'clamp(20px, 5vw, 32px)'
      }}>
        <div className="stat-card" style={{
          padding: 'clamp(20px, 5vw, 28px)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            marginBottom: '0.5rem',
            color: '#f59e0b'
          }}>{stats.pendingRequests}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Pending Requests</p>
        </div>
        <div className="stat-card" style={{
          padding: 'clamp(20px, 5vw, 28px)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            marginBottom: '0.5rem',
            color: '#10b981'
          }}>{stats.approvedRequests}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Approved by You</p>
        </div>
        <div className="stat-card" style={{
          padding: 'clamp(20px, 5vw, 28px)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            marginBottom: '0.5rem',
            color: '#ef4444'
          }}>{stats.rejectedRequests}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Rejected by You</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'clamp(20px, 5vw, 28px)' }}>
        <h3 style={{ 
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          marginBottom: 'clamp(16px, 4vw, 20px)',
          textAlign: 'center'
        }}>Quick Actions</h3>
        <div className="action-buttons" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: 'clamp(10px, 2.5vw, 15px)', 
          marginTop: '20px' 
        }}>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/parent/pl-requests'}
            style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              padding: 'clamp(12px, 3vw, 14px) clamp(16px, 4vw, 24px)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            View Requests
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/parent/request-history'}
            style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              padding: 'clamp(12px, 3vw, 14px) clamp(16px, 4vw, 24px)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Request History
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
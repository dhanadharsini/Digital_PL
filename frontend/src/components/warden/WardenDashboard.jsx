import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const WardenDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRequests: 0,
    studentsOnVacation: 0
  });
  const [error, setError] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Reports', path: '/warden/reports' }
  ];

  useEffect(() => {
    fetchStats();

    // Auto-refresh stats every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/warden/stats');
      console.log('Received stats:', response.data);
      setStats({
        totalStudents: response.data.totalStudents || 0,
        pendingRequests: response.data.pendingRequests || 0,
        studentsOnVacation: response.data.studentsOnVacation || 0
      });
      setError(null);
      console.log('Dashboard stats refreshed:', new Date().toLocaleString('en-IN'));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard stats. Please refresh the page.');
      setStats({
        totalStudents: 0,
        pendingRequests: 0,
        studentsOnVacation: 0
      });
    }
  };

  return (
    <DashboardLayout title="Warden Dashboard" menuItems={menuItems}>
      {error && (
        <div style={{ 
          padding: 'clamp(16px, 4vw, 20px)', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '8px', 
          marginBottom: 'clamp(16px, 4vw, 20px)',
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div className="welcome-message">
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>Welcome, {user?.name || 'Warden'}!</h1>
        <p style={{ 
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          textAlign: 'center',
          margin: 0
        }}>Hostel Management System</p>
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
            color: '#3b82f6'
          }}>{stats.totalStudents}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Total Students</p>
        </div>
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
            color: '#ef4444'
          }}>{stats.studentsOnVacation}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Students on Vacation</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'clamp(20px, 5vw, 28px)' }}>
        <h3 style={{ 
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          marginBottom: 'clamp(16px, 4vw, 20px)',
          textAlign: 'center'
        }}>Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: 'clamp(10px, 2.5vw, 15px)', 
          marginTop: '20px' 
        }}>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/warden/qr-scanner'}
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
            QR Scanner
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/warden/pending-requests'}
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
            PL Requests
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/warden/delayed-students'}
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
            Delayed Students
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/warden/students'}
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
            All Students
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/warden/reports'}
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
              textOverflow: 'ellipsis',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
          >
            View Reports
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WardenDashboard;
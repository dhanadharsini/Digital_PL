import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    wardens: 0,
  });



  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems}>
      <div className="welcome-message">
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          marginBottom: '0.5rem',
          textAlign: 'left'
        }}>Welcome, Admin!</h1>
        <p style={{ 
          fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
          textAlign: 'left',
          margin: 0
        }}>Manage your hostel efficiently from here</p>
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
          }}>{stats.students}</h3>
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
            color: '#10b981'
          }}>{stats.parents}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Total Parents</p>
        </div>
        <div className="stat-card" style={{
          padding: 'clamp(20px, 5vw, 28px)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            marginBottom: '0.5rem',
            color: '#f59e0b'
          }}>{stats.wardens}</h3>
          <p style={{ 
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            margin: 0,
            fontWeight: '600'
          }}>Total Wardens</p>
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
            onClick={() => window.location.href = '/admin/add-student'}
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
            Add Student
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/admin/add-parent'}
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
            Add Parent
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/admin/add-warden'}
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
            Add Warden
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/admin/students'}
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
            View Students
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
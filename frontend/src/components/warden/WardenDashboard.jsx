import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
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
        <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="welcome-message">
        <h1>Welcome, {user?.name || 'Warden'}!</h1>
        <p>Hostel Management System</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingRequests}</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.studentsOnVacation}</h3>
          <p>Students on Vacation</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => window.location.href = '/warden/qr-scanner'}>
            Open QR Scanner
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/warden/pending-requests'}>
            PL Requests
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/warden/delayed-students'}>
           Delayed Students
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/warden/students'}>
            All Students
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/warden/reports'} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           View Reports
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WardenDashboard;
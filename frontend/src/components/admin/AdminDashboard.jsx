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
        <h1>Welcome, Admin!</h1>
        <p>Manage your hostel efficiently from here</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.students}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{stats.parents}</h3>
          <p>Total Parents</p>
        </div>
        <div className="stat-card">
          <h3>{stats.wardens}</h3>
          <p>Total Wardens</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={() => window.location.href = '/admin/add-student'}>
            Add New Student
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/admin/add-parent'}>
            Add New Parent
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/admin/add-warden'}>
            Add New Warden
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/admin/students'}>
            View All Students
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
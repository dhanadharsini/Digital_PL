import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    parents: 0,
    wardens: 0,
    pendingRequests: 0
  });

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

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

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Admin Dashboard" />
        
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
          <div className="stat-card">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending PL Requests</p>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
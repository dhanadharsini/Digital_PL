import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const menuItems = [
    { label: 'Dashboard', path: '/parent' },
    { label: 'PL Requests', path: '/parent/pl-requests' },
    { label: 'Request History', path: '/parent/request-history' }
  ];

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
        <Navbar title="Parent Dashboard" />
        
        <div className="welcome-message">
          <h1>Welcome, {user?.name}!</h1>
          <p>Monitor your child's permission letter requests</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
          <div className="stat-card">
            <h3>{stats.approvedRequests}</h3>
            <p>Approved by You</p>
          </div>
          <div className="stat-card">
            <h3>{stats.rejectedRequests}</h3>
            <p>Rejected by You</p>
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => window.location.href = '/parent/pl-requests'}>
              View Pending Requests
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/parent/request-history'}>
              View Request History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
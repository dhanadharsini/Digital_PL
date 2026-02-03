import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const WardenDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsInHostel: 0,
    studentsOnVacation: 0,
    pendingRequests: 0
  });

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Attendance', path: '/warden/attendance' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/warden/stats');
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
        <Navbar title="Warden Dashboard" />
        
        <div className="welcome-message">
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage hostel activities and student permissions</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
          <div className="stat-card">
            <h3>{stats.studentsInHostel}</h3>
            <p>Students in Hostel</p>
          </div>
          <div className="stat-card">
            <h3>{stats.studentsOnVacation}</h3>
            <p>Students on Vacation</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => window.location.href = '/warden/pending-requests'}>
              Review PL Requests
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/warden/students'}>
              View Students
            </button>
            <button className="btn btn-primary" onClick={() => window.location.href = '/warden/attendance'}>
              Take Attendance
            </button>
            <button className="btn btn-success" onClick={() => window.location.href = '/warden/qr-scanner'}>
              Scan QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
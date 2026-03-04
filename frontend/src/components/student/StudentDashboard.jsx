import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      setStudentProfile(response.data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
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
        <Navbar title="Student Dashboard" />
        
        <div className="welcome-message">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            {studentProfile?.profilePhoto ? (
              <img 
                src={`http://localhost:5000${studentProfile.profilePhoto}`} 
                alt="Profile" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '3px solid #3b82f6'
                }} 
              />
            ) : (
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '32px', 
                color: 'white',
                fontWeight: 'bold'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
            <div>
              <h1>Welcome, {user?.name}!</h1>
              <p>Manage your permission letters and outpasses</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>Quick Actions</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginTop: '20px' 
          }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/student/request-pl')}
            >
              Request Permission Letter
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/student/request-outpass')}
            >
              Request Outpass (4hrs)
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/student/pl-history')}
            >
              View PL History
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/student/outpass-history')}
            >
              View Outpass History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
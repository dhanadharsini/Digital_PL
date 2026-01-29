import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Student Dashboard" />
        
        <div className="welcome-message">
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your permission letters and outpasses</p>
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
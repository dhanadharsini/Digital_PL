import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, BASE_URL } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState(null);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];

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
    <DashboardLayout title="Student Dashboard" menuItems={menuItems}>
      <div className="welcome-message">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 20px)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          {studentProfile?.profilePhoto ? (
            <img
              src={`${BASE_URL}${studentProfile.profilePhoto}`}
              alt="Profile"
              style={{
                width: 'clamp(60px, 15vw, 80px)',
                height: 'clamp(60px, 15vw, 80px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #3b82f6',
                flexShrink: 0
              }}
            />
          ) : (
            <div style={{
              width: 'clamp(60px, 15vw, 80px)',
              height: 'clamp(60px, 15vw, 80px)',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(24px, 6vw, 32px)',
              color: 'white',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
          <div style={{ textAlign: 'left', flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: 'clamp(1.25rem, 4vw, 2rem)',
              marginBottom: '0.5rem',
              lineHeight: 1.2
            }}>
              Welcome, {user?.name}!
            </h1>
            <p style={{
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              margin: 0,
              lineHeight: 1.4
            }}>
              Manage your permission letters and outpasses
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Quick Actions</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'clamp(10px, 2vw, 15px)',
          marginTop: '20px'
        }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/student/request-pl')}
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
            Request PL
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/student/request-outpass')}
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
            Outpass (4hrs)
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/student/pl-history')}
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
            PL History
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/student/outpass-history')}
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
            Outpass History
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
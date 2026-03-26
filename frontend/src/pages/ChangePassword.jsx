import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ChangePassword() {
  const { user, logout, isTempPassword: contextIsTempPassword } = useAuth();
  const navigate = useNavigate();
  const [isTempPassword, setIsTempPassword] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check localStorage directly in case context state was lost
    const tempPasswordFlag = localStorage.getItem('isTempPassword');
    console.log('Raw localStorage isTempPassword:', tempPasswordFlag);
    
    if (tempPasswordFlag === 'true' || tempPasswordFlag === true) {
      console.log('Setting isTempPassword to true from localStorage');
      setIsTempPassword(true);
    } else if (contextIsTempPassword) {
      console.log('Setting isTempPassword to true from context');
      setIsTempPassword(true);
    } else {
      console.log('Setting isTempPassword to false');
      setIsTempPassword(false);
    }

    // Detect theme
    const detectTheme = () => {
      const isLight = document.body.classList.contains('light-mode') || 
                     localStorage.getItem('theme') === 'light';
      setIsLightMode(isLight);
    };
    detectTheme();
    // Listen for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [contextIsTempPassword]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleBackToDashboard = () => {
    // Only allow navigation back if it's not a temporary password scenario
    if (!isTempPassword) {
      // Navigate based on user role
      if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'warden') {
        navigate('/warden');
      } else {
        navigate('/dashboard'); // fallback
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('=== CHANGE PASSWORD SUBMISSION ===');
    console.log('isTempPassword state:', isTempPassword);
    console.log('localStorage isTempPassword:', localStorage.getItem('isTempPassword'));

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isTempPassword && !formData.currentPassword) {
      setError('Please provide current password');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Preparing payload...');
      
      const payload = {
        newPassword: formData.newPassword,
        isTempPassword: isTempPassword,
        currentPassword: formData.currentPassword || ''
      };

      console.log('Sending payload:', {
        newPassword: '***',
        isTempPassword: payload.isTempPassword,
        currentPassword: payload.currentPassword ? '***' : ''
      });

      const response = await api.post('/auth/change-password', payload);
      
      console.log('Password change response:', response.data);
      setSuccess('Password changed successfully!');
      
      // Clear temporary password flag
      localStorage.removeItem('isTempPassword');
      
      // Only logout and redirect if it was a temporary password
      if (isTempPassword) {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        // For normal password changes, redirect to dashboard after success
        setTimeout(() => {
          if (user.role === 'student') {
            navigate('/student');
          } else if (user.role === 'warden') {
            navigate('/warden');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Password change error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isLightMode ? 'light-mode' : ''} style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isLightMode ? '#f8fafc' : '#0f172a',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Back Button - Only show if not temporary password */}
      {!isTempPassword && (
        <button
          onClick={handleBackToDashboard}
          className="btn btn-secondary"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: 'auto',
            width: 'auto'
          }}
        >
          ← Back
        </button>
      )}

      <div className="reset-modal-content" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '48px 40px'
      }}>
        {/* Header */}
        <div className="reset-modal-header" style={{
          textAlign: 'center', 
          marginBottom: '32px',
          padding: '0',
          borderRadius: '0',
          background: 'transparent'
        }}>
          <div className="reset-icon" style={{ 
            fontSize: '56px', 
            marginBottom: '16px'
          }}>🔐</div>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            {isTempPassword ? 'Set New Password' : 'Change Password'}
          </h3>
          <p style={{
            fontSize: '15px',
            margin: 0,
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            {isTempPassword 
              ? '🔒 Please set a new password to secure your account' 
              : '🔑 Update your password to keep your account secure'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" style={{
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="alert alert-success" style={{
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isTempPassword && (
            <div className="form-group">
              <label style={{
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: '8px',
                display: 'block',
                letterSpacing: '0.2px'
              }}>
                🔑 Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required={!isTempPassword}
              />
            </div>
          )}

          <div className="form-group">
            <label style={{
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block',
              letterSpacing: '0.2px'
            }}>
              🔐 New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div className="form-group">
            <label style={{
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block',
              letterSpacing: '0.2px'
            }}>
              ✅ Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              fontSize: '16px',
              fontWeight: '700',
              padding: '16px 24px',
              letterSpacing: '0.3px'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Changing Password...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                🔐 {isTempPassword ? 'Set New Password' : 'Change Password'}
              </span>
            )}
          </button>
          
          {/* Add keyframe animation */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

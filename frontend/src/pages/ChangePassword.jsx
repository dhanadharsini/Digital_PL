import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ChangePassword() {
  const { user, logout, isTempPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isTempPassword && !user) {
    navigate('/login');
    return null;
  }

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

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword || formData.currentPassword,
        newPassword: formData.newPassword
      });

      setSuccess('Password changed successfully!');
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '16px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 6px 0'
          }}>
            Change Password
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: 0,
            fontWeight: '500'
          }}>
            {isTempPassword 
              ? 'Please set a new password to secure your account' 
              : 'Update your password'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ✓ {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isTempPassword && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontWeight: '600',
                color: '#374151',
                fontSize: '13px',
                marginBottom: '6px',
                display: 'block'
              }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required={!isTempPassword}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontWeight: '600',
              color: '#374151',
              fontSize: '13px',
              marginBottom: '6px',
              display: 'block'
            }}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontWeight: '600',
              color: '#374151',
              fontSize: '13px',
              marginBottom: '6px',
              display: 'block'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? 'Changing Password...' : '🔐 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

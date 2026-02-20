import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedRole = localStorage.getItem('rememberedRole');
    
    if (rememberedEmail && rememberedRole) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        role: rememberedRole
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
      localStorage.setItem('rememberedRole', formData.role);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedRole');
    }

    const result = await login(formData.email, formData.password, formData.role);
    
    if (result.success) {
      navigate(`/${formData.role}`);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      console.log('Sending password reset request for:', resetEmail);
      const response = await api.post('/auth/forgot-password', { 
        email: resetEmail 
      });
      
      console.log('Password reset response:', response.data);
      
      // Show success message regardless of response
      setResetMessage('success');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 5000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      console.error('Error response:', err.response);
      
      // Even on error, show success to prevent email enumeration
      setResetMessage('success');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 5000);
    } finally {
      setResetLoading(false);
    }
  };

  const roleDetails = {
    student: {
      icon: '🎓',
      color: '#2563eb',
      name: 'Student'
    },
    parent: {
      icon: '👨‍👩‍👧',
      color: '#059669',
      name: 'Parent'
    },
    warden: {
      icon: '👔',
      color: '#d97706',
      name: 'Warden'
    },
    admin: {
      icon: '⚙️',
      color: '#dc2626',
      name: 'Admin'
    }
  };

  const currentRole = roleDetails[formData.role];

  const EyeIcon = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      overflow: 'auto',
      background: '#0f172a',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)),
          url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(148, 163, 184, 0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>')
        `,
        backgroundSize: 'cover, 50px 50px'
      }} />

      {/* Decorative Elements */}
      <div style={{
        position: 'fixed',
        top: '-5%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      
      <div style={{
        position: 'fixed',
        bottom: '-5%',
        left: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="confirmation-modal" 
          onClick={() => {
            setShowForgotPassword(false);
            setResetEmail('');
            setResetMessage('');
          }}
        >
          <div 
            className="password-reset-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '0',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '28px 32px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '8px'
              }}>
                🔐
              </div>
              <h3 style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: '700',
                margin: '0 0 6px 0'
              }}>
                Reset Password
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '14px',
                margin: 0,
                fontWeight: '500'
              }}>
                Enter your email to receive reset instructions
              </p>
            </div>
            
            <div style={{ padding: '28px 32px' }}>
              {resetMessage === '' && (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      fontWeight: '600', 
                      color: '#374151', 
                      fontSize: '13px',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="text"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      autoFocus
                      autoComplete="off"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        color: '#111827',
                        backgroundColor: '#ffffff',
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

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={resetLoading}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        cursor: resetLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {resetLoading ? 'Sending...' : '📧 Send Reset Link'}
                    </button>
                    <button 
                      type="button"
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        background: '#f3f4f6',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        color: '#6b7280',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                        setResetMessage('');
                      }}
                      disabled={resetLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {resetMessage === 'success' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ 
                    fontSize: '56px', 
                    marginBottom: '16px'
                  }}>
                    ✅
                  </div>
                  <h4 style={{
                    color: '#059669',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: '0 0 12px 0'
                  }}>
                    Email Sent!
                  </h4>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 20px 0',
                    lineHeight: '1.6'
                  }}>
                    Please check your inbox at<br/>
                    <strong style={{ color: '#374151' }}>{resetEmail}</strong>
                  </p>
                  <button 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                      setResetMessage('');
                    }}
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: '#059669',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Got it!
                  </button>
                </div>
              )}

              {resetMessage === 'error' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ 
                    fontSize: '56px', 
                    marginBottom: '16px'
                  }}>
                    ❌
                  </div>
                  <h4 style={{
                    color: '#dc2626',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: '0 0 12px 0'
                  }}>
                    Failed to Send
                  </h4>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    margin: '0 0 20px 0',
                    lineHeight: '1.6'
                  }}>
                    We couldn't find an account with that email address.
                  </p>
                  <button 
                    onClick={() => setResetMessage('')}
                    style={{
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: '#6366f1',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        padding: '32px 40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            fontSize: '52px', 
            marginBottom: '12px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))'
          }}>
            🏢
          </div>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '6px',
            letterSpacing: '-0.5px'
          }}>
            Hostel Portal
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '14px',
            margin: '0',
            fontWeight: '500'
          }}>
            Secure Access to Hostel Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ 
              fontWeight: '700', 
              color: '#374151', 
              fontSize: '13px',
              marginBottom: '10px',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Login As
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px'
            }}>
              {Object.entries(roleDetails).map(([key, details]) => (
                <div
                  key={key}
                  onClick={() => setFormData({...formData, role: key})}
                  style={{
                    padding: '10px 6px',
                    border: formData.role === key 
                      ? `2px solid ${details.color}` 
                      : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: formData.role === key 
                      ? `${details.color}10` 
                      : '#f9fafb',
                    transform: formData.role === key ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>
                    {details.icon}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    fontWeight: '700',
                    color: formData.role === key ? details.color : '#6b7280',
                    letterSpacing: '0.2px'
                  }}>
                    {details.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#374151', 
              fontSize: '13px',
              marginBottom: '6px',
              display: 'block'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  borderWidth: '2px',
                  borderColor: focusedField === 'email' ? currentRole.color : '#d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  background: focusedField === 'email' ? '#f0f9ff' : '#f9fafb',
                  boxShadow: focusedField === 'email' ? `0 0 0 3px ${currentRole.color}15` : 'none',
                  color: '#1f2937'
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
              {formData.email && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: '700'
                }}>
                  ✓
                </span>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#374151', 
              fontSize: '13px',
              marginBottom: '6px',
              display: 'block'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 14px',
                  borderWidth: '2px',
                  borderColor: focusedField === 'password' ? currentRole.color : '#d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  background: focusedField === 'password' ? '#f0f9ff' : '#f9fafb',
                  boxShadow: focusedField === 'password' ? `0 0 0 3px ${currentRole.color}15` : 'none',
                  color: '#1f2937'
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: focusedField === 'password' ? currentRole.color : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              cursor: 'pointer',
              color: '#6b7280',
              fontWeight: '500',
              margin: 0
            }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  cursor: 'pointer', 
                  accentColor: currentRole.color,
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px'
                }}
              />
              Remember me
            </label>
            <a 
              href="#" 
              style={{ 
                color: currentRole.color, 
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px'
              }}
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontWeight: '700',
              fontSize: '15px',
              background: currentRole.color,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${currentRole.color}40`,
              transition: 'all 0.2s ease',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error" style={{ 
              marginTop: '20px',
              animation: 'slideUp 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '14px' }}>{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          <p style={{ color: '#9ca3af', margin: '0', fontWeight: '500' }}>
            Need help? <span style={{ color: currentRole.color, fontWeight: '600' }}>dhanadharsinis@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
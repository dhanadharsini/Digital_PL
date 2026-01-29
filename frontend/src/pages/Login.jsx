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
      const response = await api.post('/auth/forgot-password', { 
        email: resetEmail 
      });
      
      setResetMessage('success');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 5000);
      
    } catch (err) {
      setResetMessage('error');
      console.error('Password reset error:', err);
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
      name: 'Administrator'
    }
  };

  const currentRole = roleDetails[formData.role];

  const EyeIcon = () => (
    <svg 
      width="20" 
      height="20" 
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
      width="20" 
      height="20" 
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
      overflow: 'hidden',
      background: '#0f172a',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
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
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)'
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
          >
            {/* Modal Header */}
            <div className="reset-modal-header">
              <div className="reset-icon">🔐</div>
              <h3>Reset Password</h3>
              <p>Enter your email address to receive password reset instructions</p>
            </div>
            
            {resetMessage === '' && (
              <form onSubmit={handleForgotPassword} className="reset-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    autoFocus
                  />
                </div>

                <div className="reset-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span className="spinner-small" />
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary"
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
              <div className="reset-success">
                <div className="success-icon">✅</div>
                <h4>Email Sent Successfully!</h4>
                <div className="success-message">
                  <p>Please check your inbox at</p>
                  <strong>{resetEmail}</strong>
                  <p>for password reset instructions.</p>
                </div>
              </div>
            )}

            {resetMessage === 'error' && (
              <div className="reset-error">
                <div className="error-icon">❌</div>
                <h4>Error</h4>
                <p>Failed to send reset email. Please verify your email address and try again.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setResetMessage('')}
                  style={{ marginTop: '20px' }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        padding: '50px 60px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '550px',
        position: 'relative',
        zIndex: 1,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '15px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}>
            🏢
          </div>
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            Hostel Portal
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '15px',
            margin: '0',
            fontWeight: '500'
          }}>
            Secure Access to Hostel Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#334155', 
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block'
            }}>
              Login As
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}>
              {Object.entries(roleDetails).map(([key, details]) => (
                <div
                  key={key}
                  onClick={() => setFormData({...formData, role: key})}
                  style={{
                    padding: '12px 8px',
                    border: formData.role === key 
                      ? `2px solid ${details.color}` 
                      : '2px solid #e2e8f0',
                    borderRadius: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: formData.role === key 
                      ? `${details.color}10` 
                      : 'white',
                    transform: formData.role === key ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                    {details.icon}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: formData.role === key ? details.color : '#64748b'
                  }}>
                    {details.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#334155', 
              fontSize: '14px',
              marginBottom: '8px',
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
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '14px 40px 14px 16px',
                  borderWidth: '2px',
                  borderColor: focusedField === 'email' ? currentRole.color : '#e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  background: '#f8fafc'
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
              {formData.email && (
                <span style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '18px'
                }}>
                  ✓
                </span>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ 
              fontWeight: '600', 
              color: '#334155', 
              fontSize: '14px',
              marginBottom: '8px',
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
                  padding: '14px 45px 14px 16px',
                  borderWidth: '2px',
                  borderColor: focusedField === 'password' ? currentRole.color : '#e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  background: '#f8fafc'
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = currentRole.color}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
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
            marginBottom: '28px',
            fontSize: '14px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: '500'
            }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  cursor: 'pointer', 
                  accentColor: currentRole.color,
                  width: '18px',
                  height: '18px'
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
                transition: 'opacity 0.2s'
              }}
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
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
              padding: '16px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              fontSize: '16px',
              background: currentRole.color,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 8px 20px ${currentRole.color}40`,
              transition: 'all 0.3s ease',
              transform: loading ? 'scale(0.98)' : 'scale(1)',
              opacity: loading ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = `0 12px 28px ${currentRole.color}50`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 8px 20px ${currentRole.color}40`;
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="spinner" style={{ 
                  width: '18px', 
                  height: '18px',
                  borderWidth: '2px',
                  borderTopColor: 'white'
                }} />
                Signing in...
              </span>
            ) : (
              <>Sign In</>
            )}
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
          marginTop: '30px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0' }}>
            Need assistance? Contact <span style={{ color: currentRole.color, fontWeight: '600' }}>support@hostel.edu</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
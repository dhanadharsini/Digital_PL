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
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  
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

    try {
      const result = await login(formData.email, formData.password, formData.role);
      if (result.success) {
        if (result.isTempPassword) {
          navigate(`/${formData.role}/change-password`);
        } else {
          navigate(`/${formData.role}`);
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMessage('success');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setResetMessage('success');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } finally {
      setResetLoading(false);
    }
  };

  const roles = [
    { key: 'student', label: 'Student', icon: '🎓', color: '#3b82f6' },
    { key: 'parent', label: 'Parent', icon: '👨‍👩‍👧', color: '#10b981' },
    { key: 'warden', label: 'Warden', icon: '👔', color: '#f59e0b' },
    { key: 'admin', label: 'Admin', icon: '⚙️', color: '#8b5cf6' }
  ];

  const currentRole = roles.find(r => r.key === formData.role);

  return (
    <div style={styles.pageContainer}>
      {/* Animated Background */}
      <div style={styles.backgroundLayer}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
        <div style={styles.gridBg}></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => {
          setShowForgotPassword(false);
          setResetEmail('');
          setResetMessage('');
        }}>
          <div style={styles.modalPanel} onClick={e => e.stopPropagation()}>
            {resetMessage === '' && (
              <>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  style={styles.modalCloseBtn}
                >
                  ✕
                </button>
                <div style={styles.modalIconBox}>🔐</div>
                <h3 style={styles.modalTitle}>Reset Your Password</h3>
                <p style={styles.modalText}>Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleForgotPassword} style={styles.modalForm}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={styles.modalInputField}
                  />
                  <button type="submit" disabled={resetLoading} style={styles.modalSubmitBtn}>
                    {resetLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                  </button>
                </form>
              </>
            )}

            {resetMessage === 'success' && (
              <div style={styles.successBox}>
                <div style={styles.successCheckmark}>✓</div>
                <h3 style={styles.successTitle}>Check Your Email!</h3>
                <p style={styles.successText}>We've sent password reset instructions. Check your inbox and spam folder.</p>
                <button onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setResetMessage('');
                }} style={styles.successBtn}>
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div style={styles.mainContainer}>
        {/* Left Side - Brand Section */}
        <div style={styles.leftSide}>
          <div style={styles.brandContainer}>
            <div style={styles.brandIconWrapper}>
              <div style={styles.brandIcon}>🏢</div>
            </div>
            <h1 style={styles.brandName}>Hostel Portal</h1>
            <p style={styles.brandDesc}>Intelligent Management System</p>
            
            <div style={styles.benefitsSection}>
              <div style={styles.benefitItem}>
                <span style={styles.benefitIcon}>✨</span>
                <div style={styles.benefitContent}>
                  <p style={styles.benefitTitle}>Smart Management</p>
                  <p style={styles.benefitSubtitle}>Streamlined operations</p>
                </div>
              </div>
              <div style={styles.benefitItem}>
                <span style={styles.benefitIcon}>🔒</span>
                <div style={styles.benefitContent}>
                  <p style={styles.benefitTitle}>Secure & Safe</p>
                  <p style={styles.benefitSubtitle}>Enterprise-grade security</p>
                </div>
              </div>
              <div style={styles.benefitItem}>
                <span style={styles.benefitIcon}>⚡</span>
                <div style={styles.benefitContent}>
                  <p style={styles.benefitTitle}>Lightning Fast</p>
                  <p style={styles.benefitSubtitle}>Real-time processing</p>
                </div>
              </div>
              <div style={styles.benefitItem}>
                <span style={styles.benefitIcon}>📊</span>
                <div style={styles.benefitContent}>
                  <p style={styles.benefitTitle}>Analytics</p>
                  <p style={styles.benefitSubtitle}>Detailed insights</p>
                </div>
              </div>
            </div>

            <div style={styles.statsSection}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>500+</div>
                <div style={styles.statLabel}>Active Users</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>99.9%</div>
                <div style={styles.statLabel}>Uptime</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>24/7</div>
                <div style={styles.statLabel}>Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div style={styles.rightSide}>
          <div style={styles.formPanel}>
            {/* Header */}
            <div style={styles.formHead}>
              <div style={styles.greeting}>
                <h2 style={styles.formTitle}>Digital PL</h2>
                <p style={styles.formCaption}>Sign in to your account to continue</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.loginForm}>
              {/* Role Selection with Enhanced UI */}
              <div style={styles.roleSelectionBox}>
                <label style={styles.roleLabel}>Choose Your Role</label>
                <div style={styles.roleButtonsContainer}>
                  {roles.map(role => (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setFormData({...formData, role: role.key})}
                      style={{
                        ...styles.roleButton,
                        ...(formData.role === role.key ? {
                          ...styles.roleButtonActive,
                          borderColor: role.color,
                          background: `linear-gradient(135deg, ${role.color}20 0%, ${role.color}10 100%)`,
                          boxShadow: `0 8px 20px ${role.color}30`
                        } : {})
                      }}
                    >
                      <span style={{
                        ...styles.roleButtonIcon,
                        color: formData.role === role.key ? role.color : 'currentColor'
                      }}>
                        {role.icon}
                      </span>
                      <span style={{
                        ...styles.roleButtonName,
                        color: formData.role === role.key ? role.color : 'inherit'
                      }}>
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div style={styles.inputGroup}>
                <label style={{...styles.inputLabel, color: focusedField === 'email' ? currentRole.color : 'inherit'}}>
                  Email Address
                </label>
                <div style={{...styles.inputContainer, borderColor: focusedField === 'email' ? currentRole.color : 'rgba(255, 255, 255, 0.1)'}}>
                  <svg style={styles.inputIconLeft} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-10 5L2 7"/>
                  </svg>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    placeholder="you@example.com"
                    required
                    style={styles.inputField}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={styles.inputGroup}>
                <label style={{...styles.inputLabel, color: focusedField === 'password' ? currentRole.color : 'inherit'}}>
                  Password
                </label>
                <div style={{...styles.inputContainer, borderColor: focusedField === 'password' ? currentRole.color : 'rgba(255, 255, 255, 0.1)'}}>
                  <svg style={styles.inputIconLeft} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    placeholder="••••••••"
                    required
                    style={styles.inputField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{...styles.passwordToggleButton, color: focusedField === 'password' ? currentRole.color : 'rgba(255, 255, 255, 0.6)'}}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={styles.optionsBar}>
                <label style={styles.rememberMeCheckbox}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{...styles.checkboxInput, accentColor: currentRole.color}}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{...styles.forgotPasswordLink, color: currentRole.color}}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  background: loading ? `${currentRole.color}80` : `linear-gradient(135deg, ${currentRole.color} 0%, ${currentRole.color}dd 100%)`,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.loadingSpinner}></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span style={styles.buttonArrow}>→</span>
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div style={styles.errorBox}>
                  <span style={styles.errorIconBox}>⚠️</span>
                  <div style={styles.errorContent}>
                    <p style={styles.errorTitle}>Authentication Failed</p>
                    <p style={styles.errorMessage}>{error}</p>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div style={styles.formFooter}>
              <p style={styles.footerText}>
                Need help? <span style={{color: currentRole.color, fontWeight: '600', cursor: 'pointer'}}>Contact Support</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
          background: transparent !important;
          -webkit-autofill-background-color: transparent !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          caret-color: #93c5fd !important;
          opacity: 1 !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: none !important;
          box-shadow: none !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #93c5fd !important;
          background-color: transparent !important;
          opacity: 1 !important;
        }
        input:autofill {
          background-color: transparent !important;
          color: #ffffff !important;
          opacity: 1 !important;
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }
        input:-webkit-autofill::first-line {
          color: #1e293b !important;
        }
        /* Autocomplete dropdown styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #1e293b !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
        }
        /* Chrome autofill list */
        datalist option {
          background-color: #1e3a8a !important;
          color: #ffffff !important;
        }
        option {
          background-color: #1e3a8a !important;
          color: #ffffff !important;
        }
        option:checked {
          background: linear-gradient(#1e3a8a, #1e3a8a) !important;
          background-color: #1e3a8a !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f1823 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundLayer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-150px',
    right: '-100px',
    animation: 'float 8s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: '-100px',
    left: '10%',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  blob3: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '30%',
    left: '-80px',
    animation: 'float 12s ease-in-out infinite',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
    backgroundSize: '100px 100px',
  },
  mainContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '1400px',
    height: 'auto',
    minHeight: '700px',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideInFromLeft 0.8s ease',
  },
  leftSide: {
    flex: 1,
    display: 'none',
    '@media (min-width: 1024px)': {
      display: 'flex',
    },
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 50px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.3) 100%)',
    position: 'relative',
    borderRight: '1px solid rgba(59, 130, 246, 0.15)',
  },
  brandContainer: {
    textAlign: 'center',
    maxWidth: '380px',
    animation: 'slideInFromLeft 1s ease',
  },
  brandIconWrapper: {
    marginBottom: '24px',
  },
  brandIcon: {
    fontSize: '64px',
    display: 'inline-block',
    animation: 'float 4s ease-in-out infinite',
  },
  brandName: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-1.5px',
  },
  brandDesc: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 48px 0',
    fontWeight: '400',
  },
  benefitsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '48px',
  },
  benefitItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(59, 130, 246, 0.15)',
  },
  benefitIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  benefitContent: {
    textAlign: 'left',
  },
  benefitTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0',
  },
  benefitSubtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '2px 0 0 0',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '4px',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    animation: 'slideInFromRight 1s ease',
  },
  formPanel: {
    width: '100%',
    maxWidth: '450px',
  },
  formHead: {
    marginBottom: '40px',
  },
  greeting: {
    textAlign: 'center',
  },
  formTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  formCaption: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  roleSelectionBox: {
    marginBottom: '12px',
  },
  roleLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  roleButtonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  roleButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px 12px',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '600',
  },
  roleButtonActive: {
    transform: 'translateY(-2px)',
  },
  roleButtonIcon: {
    fontSize: '22px',
    transition: 'transform 0.3s ease',
  },
  roleButtonName: {
    fontSize: '11px',
    fontWeight: '700',
    transition: 'color 0.3s ease',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    transition: 'color 0.2s ease',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    borderRadius: '10px',
    background: '#1e3a8a',
    padding: '12px 16px',
    transition: 'all 0.3s ease',
    minHeight: '52px',
  },
  inputIconLeft: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: '8px',
    flexShrink: 0,
  },
  inputField: {
    flex: 1,
    border: 'none',
    background: 'transparent !important',
    padding: '6px 12px',
    fontSize: '16px',
    lineHeight: '1.6',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#ffffff',
    letterSpacing: '0.3px',
    boxShadow: 'none !important',
    WebkitBoxShadow: 'none !important',
    opacity: '1 !important',
  },
  passwordToggleButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 8px',
    fontSize: '18px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  rememberMeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  checkboxInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  forgotPasswordLink: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: 0,
  },
  submitButton: {
    padding: '13px 20px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonArrow: {
    display: 'inline-block',
    transition: 'transform 0.3s ease',
    fontSize: '16px',
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    gap: '12px',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    marginTop: '12px',
  },
  errorIconBox: {
    fontSize: '18px',
    flexShrink: 0,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fca5a5',
    margin: '0 0 2px 0',
  },
  errorMessage: {
    fontSize: '12px',
    color: '#fecaca',
    margin: 0,
  },
  formFooter: {
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    textAlign: 'center',
  },
  securityBadge: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    display: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
    animation: 'fadeIn 0.3s ease',
  },
  modalPanel: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
    borderRadius: '20px',
    padding: '40px',
    width: '90%',
    maxWidth: '420px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(15px)',
    animation: 'slideInFromRight 0.4s ease',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s ease',
  },
  modalIconBox: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  modalText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 24px 0',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalInputField: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '2px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    marginBottom: '8px',
  },
  modalSubmitBtn: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  successBox: {
    textAlign: 'center',
    padding: '12px 0',
  },
  successCheckmark: {
    width: '60px',
    height: '60px',
    background: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '32px',
    color: '#22c55e',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  successText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: '0 0 20px 0',
  },
  successBtn: {
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default Login;

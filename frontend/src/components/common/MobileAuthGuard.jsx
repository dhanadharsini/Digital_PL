import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const MobileAuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    setIsMobile(mobileRegex.test(userAgent));
    
    // Add mobile-specific auth stability
    if (isMobile) {
      // Prevent unwanted redirects on mobile
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        console.log('Mobile navigation detected:', args[2]);
        return originalPushState.apply(this, args);
      };
      
      window.history.replaceState = function(...args) {
        console.log('Mobile replace detected:', args[2]);
        return originalReplaceState.apply(this, args);
      };
      
      return () => {
        // Cleanup
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      // Add delay for mobile to ensure auth state is stable
      const timer = setTimeout(() => {
        setAuthChecked(true);
      }, isMobile ? 1000 : 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isMobile]);

  if (loading || !authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--primary)',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default MobileAuthGuard;

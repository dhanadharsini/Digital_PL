import React, { useState, useEffect } from 'react';
import { usePWA } from '../../utils/pwaUtils';

const OfflineStatus = () => {
  const { isOnline } = usePWA();
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isOnline) {
      setStatusMessage('You are currently offline. Some features may be limited.');
      setShowStatus(true);
    } else {
      setStatusMessage('Connection restored! All features are available.');
      setShowStatus(true);
      
      // Hide success message after 3 seconds
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showStatus) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1001,
      maxWidth: '90%',
      width: '400px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: isOnline 
        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
        : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
      color: isOnline ? '#a7f3d0' : '#fca5a5',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideDown 0.3s ease-out'
    }}>
      <span style={{ fontSize: '18px' }}>
        {isOnline ? '🟢' : '🔴'}
      </span>
      <span style={{ flex: 1 }}>
        {statusMessage}
      </span>
      <button
        onClick={() => setShowStatus(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0',
          lineHeight: '1',
          opacity: '0.7',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '0.7';
        }}
      >
        ×
      </button>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default OfflineStatus;

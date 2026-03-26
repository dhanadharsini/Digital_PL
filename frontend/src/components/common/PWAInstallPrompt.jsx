import React, { useState, useEffect } from 'react';
import { usePWA } from '../../utils/pwaUtils';

const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, isPWA, install } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after 3 seconds if app can be installed and not dismissed
    if (canInstall && !dismissed && !isInstalled && !isPWA) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, dismissed, isInstalled, isPWA]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || isInstalled || isPWA) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#f1f5f9',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      maxWidth: '90%',
      width: '350px',
      border: '1px solid #475569',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '24px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          📱
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#f1f5f9'
          }}>
            Install PL System
          </h4>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.4'
          }}>
            Install our app for faster access and offline features
          </p>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: '8px 16px',
            border: '1px solid #475569',
            background: 'transparent',
            color: '#94a3b8',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#334155';
            e.target.style.color = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#94a3b8';
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

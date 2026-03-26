import React, { useEffect, useState } from 'react';

const MobileOptimizations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check if running as PWA
    const checkStandalone = () => {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );
    };

    // Prevent zoom on input focus for iOS
    const preventZoom = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && isMobile) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    };

    // Handle orientation changes
    const handleOrientationChange = () => {
      if (screen.orientation) {
        screen.orientation.lock('portrait').catch(() => {
          // Ignore if orientation lock fails
        });
      }
    };

    // Initialize checks
    checkMobile();
    updateOnlineStatus();
    checkStandalone();
    preventZoom();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  useEffect(() => {
    // Add mobile-specific CSS classes
    if (isMobile) {
      document.body.classList.add('mobile-device');
    }
    
    if (isStandalone) {
      document.body.classList.add('pwa-standalone');
    }

    // Add online/offline status
    if (!isOnline) {
      document.body.classList.add('offline');
    } else {
      document.body.classList.remove('offline');
    }

    return () => {
      document.body.classList.remove('mobile-device', 'pwa-standalone', 'offline');
    };
  }, [isMobile, isStandalone, isOnline]);

  // This component doesn't render anything visible
  // It only handles mobile optimizations
  return null;
};

export default MobileOptimizations;

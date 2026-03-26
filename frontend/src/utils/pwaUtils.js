// PWA Utility Functions
import React from 'react';

export class PWAUtils {
  constructor() {
    this.deferredPrompt = null;
    this.installPromptEvent = null;
    this.setupInstallPrompt();
    this.setupOnlineStatus();
  }

  // Handle PWA install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.installPromptEvent = e;
      
      // Dispatch custom event for React components
      window.dispatchEvent(new CustomEvent('pwa-install-available', {
        detail: { canInstall: true }
      }));
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.deferredPrompt = null;
      
      // Dispatch custom event for React components
      window.dispatchEvent(new CustomEvent('pwa-installed', {
        detail: { installed: true }
      }));
    });
  }

  // Show install prompt
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      const result = await this.deferredPrompt.prompt();
      console.log('PWA: Install prompt result:', result);
      
      this.deferredPrompt = null;
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt error:', error);
      return false;
    }
  }

  // Check if app can be installed
  canInstall() {
    return !!this.deferredPrompt;
  }

  // Check if app is running as PWA
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Setup online/offline status monitoring
  setupOnlineStatus() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      console.log('PWA: Online status changed:', isOnline);
      
      // Dispatch custom event for React components
      window.dispatchEvent(new CustomEvent('pwa-online-status', {
        detail: { isOnline }
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial status
    updateOnlineStatus();
  }

  // Get current online status
  isOnline() {
    return navigator.onLine;
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('PWA: This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWA: Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('PWA: Notification permission error:', error);
      return false;
    }
  }

  // Show local notification
  async showNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('PWA: Notifications not available or permission not granted');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [100, 50, 100],
        ...options
      });
      return true;
    } catch (error) {
      console.error('PWA: Show notification error:', error);
      return false;
    }
  }

  // Share content (Web Share API)
  async shareContent(title, text, url) {
    if (!navigator.share) {
      console.log('PWA: Web Share API not supported');
      return false;
    }

    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('PWA: Share error:', error);
      }
      return false;
    }
  }

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('PWA: Copy to clipboard error:', error);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }

  // Get device info
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isPWA: this.isPWA(),
      isOnline: this.isOnline(),
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
  }

  // Check if specific feature is supported
  isFeatureSupported(feature) {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      webShare: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      indexedDB: 'indexedDB' in window,
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
          return false;
        }
      })()
    };

    return features[feature] || false;
  }

  // Get all supported features
  getSupportedFeatures() {
    const features = {};
    const featureList = [
      'serviceWorker', 'notifications', 'pushManager', 'webShare', 
      'clipboard', 'camera', 'geolocation', 'localStorage', 
      'sessionStorage', 'indexedDB', 'webGL'
    ];

    featureList.forEach(feature => {
      features[feature] = this.isFeatureSupported(feature);
    });

    return features;
  }
}

// Create singleton instance
export const pwaUtils = new PWAUtils();

// Simple React hook without useState issues
export function usePWA() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isPWA, setIsPWA] = React.useState(pwaUtils.isPWA());

  React.useEffect(() => {
    const handleOnlineStatus = (e) => setIsOnline(e.detail.isOnline);

    window.addEventListener('pwa-online-status', handleOnlineStatus);

    return () => {
      window.removeEventListener('pwa-online-status', handleOnlineStatus);
    };
  }, []);

  const showNotification = async (title, options) => {
    return await pwaUtils.showNotification(title, options);
  };

  const share = async (title, text, url) => {
    return await pwaUtils.shareContent(title, text, url);
  };

  const copy = async (text) => {
    return await pwaUtils.copyToClipboard(text);
  };

  return {
    isOnline,
    isPWA,
    showNotification,
    share,
    copy,
    deviceInfo: pwaUtils.getDeviceInfo(),
    supportedFeatures: pwaUtils.getSupportedFeatures(),
    canInstall: () => pwaUtils.canInstall(),
    install: () => pwaUtils.showInstallPrompt()
  };
}

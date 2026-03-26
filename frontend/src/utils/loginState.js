// Login State Manager for PWA
export class LoginStateManager {
  constructor() {
    this.initialize();
  }

  initialize() {
    // Check if running as PWA
    this.isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone === true ||
                   document.referrer.includes('android-app://');

    if (this.isPWA) {
      console.log('Running as PWA - initializing login state management');
      this.setupPWANavigation();
    }
  }

  setupPWANavigation() {
    // Get current login state
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const currentPath = window.location.pathname;

    console.log('PWA Navigation Check:', {
      hasToken: !!token,
      hasUser: !!user,
      currentPath
    });

    // PWA Navigation Logic
    if (token && user) {
      // User is logged in
      if (currentPath === '/' || currentPath === '/login') {
        console.log('PWA: User logged in, redirecting to dashboard');
        this.redirectToDashboard();
      }
    } else {
      // User not logged in
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log('PWA: User not logged in, redirecting to login');
        this.redirectToLogin();
      }
    }
  }

  redirectToDashboard() {
    // Determine dashboard based on user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;

    let dashboardPath = '/dashboard';
    
    switch (role) {
      case 'admin':
        dashboardPath = '/dashboard';
        break;
      case 'student':
        dashboardPath = '/dashboard';
        break;
      case 'parent':
        dashboardPath = '/dashboard';
        break;
      case 'warden':
        dashboardPath = '/dashboard';
        break;
      default:
        dashboardPath = '/dashboard';
    }

    window.location.replace(dashboardPath);
  }

  redirectToLogin() {
    window.location.replace('/login');
  }

  // Call this after successful login
  onLoginSuccess(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    console.log('PWA: Login successful, redirecting to dashboard');
    
    if (this.isPWA) {
      // Small delay for PWA to process
      setTimeout(() => {
        this.redirectToDashboard();
      }, 100);
    }
  }

  // Call this after logout
  onLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    console.log('PWA: Logout successful, redirecting to login');
    
    if (this.isPWA) {
      setTimeout(() => {
        this.redirectToLogin();
      }, 100);
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return !!(token && user);
  }

  // Get current user
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user.role || null;
  }
}

// Create singleton instance
export const loginStateManager = new LoginStateManager();

// Export functions for easy use
export const initializeLoginState = () => loginStateManager.initialize();
export const handleLoginSuccess = (user, token) => loginStateManager.onLoginSuccess(user, token);
export const handleLogout = () => loginStateManager.onLogout();
export const checkIsLoggedIn = () => loginStateManager.isLoggedIn();
export const getCurrentUser = () => loginStateManager.getCurrentUser();
export const getUserRole = () => loginStateManager.getUserRole();
export const goToDashboard = () => loginStateManager.redirectToDashboard();
export const goToLogin = () => loginStateManager.redirectToLogin();

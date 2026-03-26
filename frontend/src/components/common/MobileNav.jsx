import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show on login page
  if (location.pathname === '/login' || location.pathname === '/change-password') {
    return null;
  }

  const getNavItems = () => {
    const role = user?.role;
    
    switch (role) {
      case 'student':
        return [
          { path: '/student', label: 'Home', icon: '🏠' },
          { path: '/student/request-pl', label: 'Request', icon: '📝' },
          { path: '/student/pl-history', label: 'History', icon: '📋' },
          { path: '/student/outpass-qr', label: 'QR', icon: '📱' }
        ];
      
      case 'parent':
        return [
          { path: '/parent', label: 'Home', icon: '🏠' },
          { path: '/parent/pl-requests', label: 'Requests', icon: '📝' },
          { path: '/parent/request-history', label: 'History', icon: '📋' }
        ];
      
      case 'warden':
        return [
          { path: '/warden', label: 'Home', icon: '🏠' },
          { path: '/warden/pending-requests', label: 'Pending', icon: '⏳' },
          { path: '/warden/students', label: 'Students', icon: '👥' },
          { path: '/warden/qr-scanner', label: 'Scanner', icon: '📱' }
        ];
      
      case 'admin':
        return [
          { path: '/admin', label: 'Home', icon: '🏠' },
          { path: '/admin/add-student', label: 'Add', icon: '➕' },
          { path: '/admin/students', label: 'Students', icon: '👥' },
          { path: '/admin/reports', label: 'Reports', icon: '📊' }
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/student' && location.pathname.startsWith(path));
  };

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">{item.icon}</div>
          <div className="mobile-nav-label">{item.label}</div>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;

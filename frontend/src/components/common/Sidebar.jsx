import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ menuItems, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleMenuClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    // Close sidebar on mobile when logout is clicked
    if (onClose) {
      onClose();
    }
  };

  // Icon mapping for menu items
  const getIcon = (label) => {
    const icons = {
      'Dashboard': '🏠',
      'விரைவான செயல்கள்': '🏠',
      'Request PL': '📝',
      'விடுப்பு மன்னப்பு கோரிக்கை': '📝',
      'Request Outpass': '🚪',
      'வெளியேறும் அனுமதி கோரிக்கை': '🚪',
      'PL History': '📋',
      'விடுப்பு மன்னப்பு வரலாறு': '📋',
      'Outpass History': '📋',
      'வெளியேறும் அனுமதி வரலாறு': '📋',
      'View QR': '📱',
      'QR குறியீட்டைப் பார்': '📱',
      'Pending Requests': '⏳',
      'Students List': '👥',
      'Delayed Students': '⚠️',
      'QR Scanner': '📷',
      'Reports': '📊',
      'User Management': '👤',
      'Add Student': '➕',
      'Add Parent': '👨‍👩‍👧‍👦',
      'Add Warden': '👮',
      'Student List': '📚',
      'Parent List': '👨‍👩‍👧‍👦',
      'Warden List': '👮'
    };
    return icons[label] || '📄';
  };

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span className="sidebar-title">Digital PL</span>
        </div>
        <div className="sidebar-user">
          <span className="user-icon">👤</span>
          <span className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </span>
        </div>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={handleMenuClick}
            >
              <span className="menu-icon">{getIcon(item.label)}</span>
              <span className="menu-text">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        <span className="menu-icon">🚪</span>
        <span className="menu-text">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
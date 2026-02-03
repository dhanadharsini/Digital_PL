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

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <h3>Hostel Management</h3>
        <p>{user?.name}</p>
        <p style={{ fontSize: '12px', textTransform: 'capitalize' }}>
          {user?.role}
        </p>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={handleMenuClick}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
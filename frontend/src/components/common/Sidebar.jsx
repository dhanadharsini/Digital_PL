import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ menuItems }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="sidebar">
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
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
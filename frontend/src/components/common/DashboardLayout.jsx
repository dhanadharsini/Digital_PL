import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title, menuItems }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-container">
            {/* Mobile Navigation Bar */}
            <div className="mobile-nav">
                <button
                    className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: 'var(--text-main)'
                }}>
                    {title}
                </h2>
                <div style={{ width: '30px' }}></div> {/* Spacer for centering */}
            </div>

            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
            ></div>

            <Sidebar
                menuItems={menuItems}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />

            <div className="main-content">
                <Navbar title={title} />
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;

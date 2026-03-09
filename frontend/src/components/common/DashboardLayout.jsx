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
            {/* Hamburger Button for Mobile */}
            <button
                className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

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

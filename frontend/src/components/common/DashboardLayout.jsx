import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title, menuItems }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Always open on mobile now

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar Overlay for Mobile (Hidden) */}
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

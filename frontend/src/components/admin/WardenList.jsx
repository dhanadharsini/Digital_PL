import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const WardenList = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const response = await api.get('/admin/wardens');
      setWardens(response.data);
    } catch (error) {
      console.error('Error fetching wardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warden?')) {
      try {
        await api.delete(`/admin/warden/${id}`);
        fetchWardens();
      } catch (error) {
        alert('Failed to delete warden');
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger Button */}
      <button 
        className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Overlay */}
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
        <Navbar title="Wardens List" />
        
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Warden ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Hostel Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wardens.map((warden) => (
                    <tr key={warden._id}>
                      <td>{warden.wardenId}</td>
                      <td>{warden.name}</td>
                      <td>{warden.email}</td>
                      <td>{warden.mobileNo}</td>
                      <td>{warden.hostelName}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDelete(warden._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenList;
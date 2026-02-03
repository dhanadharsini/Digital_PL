import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const ParentList = () => {
  const [parents, setParents] = useState([]);
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
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('/admin/parents');
      setParents(response.data);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        await api.delete(`/admin/parent/${id}`);
        fetchParents();
      } catch (error) {
        alert('Failed to delete parent');
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
        <Navbar title="Parents List" />
        
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
                    <th>Parent ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Student Name</th>
                    <th>Student Reg No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent._id}>
                      <td>{parent.parentId}</td>
                      <td>{parent.name}</td>
                      <td>{parent.email}</td>
                      <td>{parent.mobileNo}</td>
                      <td>{parent.studentName}</td>
                      <td>{parent.studentRegNo}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDelete(parent._id)}
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

export default ParentList;
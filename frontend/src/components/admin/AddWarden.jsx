import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const AddWarden = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    wardenId: '',
    name: '',
    email: '',
    password: '',
    mobileNo: '',
    hostelName: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/admin/add-warden', formData);
      setMessage({ type: 'success', text: 'Warden added successfully!' });
      setFormData({
        wardenId: '',
        name: '',
        email: '',
        password: '',
        mobileNo: '',
        hostelName: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add warden' 
      });
    } finally {
      setLoading(false);
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
        <Navbar title="Add New Warden" />
        
        <div className="card">
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Warden ID *</label>
                <input
                  type="text"
                  name="wardenId"
                  value={formData.wardenId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Warden Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hostel Name *</label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Adding Warden...' : 'Add Warden'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWarden;
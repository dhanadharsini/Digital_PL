import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const RequestPL = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    roomNo: '',
    hostelName: '',
    yearOfStudy: '',
    department: '',
    regNo: '',
    placeOfVisit: '',
    reasonOfVisit: '',
    departureDateTime: '',
    arrivalDateTime: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Request PL', path: '/student/request-pl' },
    { label: 'Request Outpass', path: '/student/request-outpass' },
    { label: 'PL History', path: '/student/pl-history' },
    { label: 'Outpass History', path: '/student/outpass-history' }
  ];


  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    try {
      const response = await api.get('/student/details');
      const student = response.data;
      setFormData({
        ...formData,
        name: student.name,
        roomNo: student.roomNo,
        hostelName: student.hostelName,
        yearOfStudy: student.yearOfStudy,
        department: student.department,
        regNo: student.regNo
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

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
      await api.post('/student/request-pl', formData);
      setMessage({ type: 'success', text: 'Permission letter request sent successfully!' });
      setFormData({
        ...formData,
        placeOfVisit: '',
        reasonOfVisit: '',
        departureDateTime: '',
        arrivalDateTime: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send request' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Request Permission Letter" />
        
        <div className="card">
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="roomNo"
                  value={formData.roomNo}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Hostel Name</label>
                <input
                  type="text"
                  name="hostelName"
                  value={formData.hostelName}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Year of Study</label>
                <input
                  type="text"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="regNo"
                  value={formData.regNo}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Place of Visit *</label>
                <input
                  type="text"
                  name="placeOfVisit"
                  value={formData.placeOfVisit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason of Visit *</label>
                <textarea
                  name="reasonOfVisit"
                  value={formData.reasonOfVisit}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Departure Date & Time *</label>
                <input
                  type="datetime-local"
                  name="departureDateTime"
                  value={formData.departureDateTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Arrival Date & Time *</label>
                <input
                  type="datetime-local"
                  name="arrivalDateTime"
                  value={formData.arrivalDateTime}
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
              {loading ? 'Sending Request...' : 'Send Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestPL;
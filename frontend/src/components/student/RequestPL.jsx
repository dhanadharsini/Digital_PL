import React, { useState, useEffect } from 'react';
import DashboardLayout from '../common/DashboardLayout';
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

    // Validate departure time is between 5:00 AM and 6:15 PM
    if (formData.departureDateTime) {
      const departureTime = new Date(formData.departureDateTime);
      const hours = departureTime.getHours();
      const minutes = departureTime.getMinutes();
      
      // Convert to 24-hour format for comparison
      // 5:00 AM = 5:00, 6:15 PM = 18:15
      if (hours < 5 || (hours === 18 && minutes > 15) || hours > 18) {
        setMessage({ 
          type: 'error', 
          text: 'Departure time must be between 5:00 AM and 6:15 PM' 
        });
        setLoading(false);
        return;
      }
    }

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
    <DashboardLayout title="Request Permission Letter" menuItems={menuItems}>
      <div className="card" style={{ padding: 'clamp(20px, 5vw, 28px)' }}>
      
        
        {message.text && (
          <div className={`alert alert-${message.type}`} style={{
            marginBottom: 'clamp(16px, 4vw, 20px)',
            padding: 'clamp(12px, 3vw, 16px)',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 4vw, 20px)' }}>
          <div className="form-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'clamp(16px, 4vw, 20px)'
          }}>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Room No</label>
              <input
                type="text"
                name="roomNo"
                value={formData.roomNo}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Hostel Name</label>
              <input
                type="text"
                name="hostelName"
                value={formData.hostelName}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Year of Study</label>
              <input
                type="text"
                name="yearOfStudy"
                value={formData.yearOfStudy}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                marginBottom: '8px',
                fontWeight: '600'
              }}>Reg No</label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                readOnly
                disabled
                className="readonly-input"
                style={{
                  fontSize: '16px', /* Prevents zoom on iOS */
                  padding: '12px 16px'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: '8px',
              fontWeight: '600'
            }}>Place of Visit</label>
            <input
              type="text"
              name="placeOfVisit"
              value={formData.placeOfVisit}
              onChange={handleChange}
              required
              style={{
                fontSize: '16px', /* Prevents zoom on iOS */
                padding: '12px 16px'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: '8px',
              fontWeight: '600'
            }}>Reason of Visit</label>
            <textarea
              name="reasonOfVisit"
              value={formData.reasonOfVisit}
              onChange={handleChange}
              required
              rows="4"
              style={{
                fontSize: '16px', /* Prevents zoom on iOS */
                padding: '12px 16px',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: '8px',
              fontWeight: '600'
            }}>Departure Date & Time</label>
            <input
              type="datetime-local"
              name="departureDateTime"
              value={formData.departureDateTime}
              onChange={handleChange}
              required
              style={{
                fontSize: '16px', /* Prevents zoom on iOS */
                padding: '12px 16px'
              }}
            />
            <div style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#64748b',
              marginTop: '6px',
              fontStyle: 'italic'
            }}>
              ⏰ Note: Departure time must be between 5:00 AM and 6:15 PM
            </div>
          </div>

          <div className="form-group">
            <label style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              marginBottom: '8px',
              fontWeight: '600'
            }}>Arrival Date & Time</label>
            <input
              type="datetime-local"
              name="arrivalDateTime"
              value={formData.arrivalDateTime}
              onChange={handleChange}
              required
              style={{
                fontSize: '16px', /* Prevents zoom on iOS */
                padding: '12px 16px'
              }}
            />
          </div>

          <div className="form-actions" style={{ 
            display: 'flex', 
            gap: 'clamp(12px, 3vw, 16px)',
            marginTop: 'clamp(20px, 5vw, 24px)',
            flexDirection: 'column'
          }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                padding: 'clamp(12px, 3vw, 14px)',
                minHeight: '48px',
                width: '100%'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RequestPL;
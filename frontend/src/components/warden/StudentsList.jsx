import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Attendance', path: '/warden/attendance' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/warden/students?filter=${filter}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
        <Navbar title="Students List" />
        
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: '600' }}>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value="all">All Students</option>
              <option value="in-hostel">In Hostel</option>
              <option value="on-vacation">On Vacation</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Room No</th>
                    <th>Year</th>
                    <th>Department</th>
                    <th>Mobile</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.regNo}</td>
                      <td>{student.name}</td>
                      <td>{student.roomNo}</td>
                      <td>{student.yearOfStudy}</td>
                      <td>{student.department}</td>
                      <td>{student.mobileNo}</td>
                      <td>
                        <span className={`status-badge ${student.isOnVacation ? 'status-pending' : 'status-approved'}`}>
                          {student.isOnVacation ? 'ON VACATION' : 'IN HOSTEL'}
                        </span>
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

export default StudentsList;
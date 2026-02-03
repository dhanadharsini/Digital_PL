import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import './DelayedStudents.css';

const DelayedStudents = () => {
  const [delayedOutpasses, setDelayedOutpasses] = useState([]);
  const [delayedVacations, setDelayedVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outpass');
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
    fetchDelayedData();
  }, []);

  const fetchDelayedData = async () => {
    try {
      const [outpassResponse, vacationResponse] = await Promise.all([
        api.get('/warden/outpass/delayed'),
        api.get('/warden/vacation/delayed')
      ]);
      
      setDelayedOutpasses(outpassResponse.data);
      setDelayedVacations(vacationResponse.data);
    } catch (error) {
      console.error('Error fetching delayed students:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
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
        <Navbar title="Delayed Students" />

        <div className="delayed-students-container">
          <div className="header-section">
            <h2>Delayed Students Tracking</h2>
            <p>Monitor students who have exceeded their allowed time limits</p>
          </div>

          <div className="tabs-container">
            <button 
              className={`tab-button ${activeTab === 'outpass' ? 'active' : ''}`}
              onClick={() => setActiveTab('outpass')}
            >
              Outpass Delays ({delayedOutpasses.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'vacation' ? 'active' : ''}`}
              onClick={() => setActiveTab('vacation')}
            >
              Vacation Delays ({delayedVacations.length})
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading delayed students...</div>
          ) : (
            <>
              {activeTab === 'outpass' && (
                <div className="tab-content">
                  <div className="section-header">
                    <h3>🕐 Outpass Delayed Returns</h3>
                    <p>Students who exceeded their 4-hour outpass duration</p>
                  </div>

                  {delayedOutpasses.length === 0 ? (
                    <div className="empty-state">
                      <h3>No Delayed Outpasses</h3>
                      <p>All students returned within their outpass duration.</p>
                    </div>
                  ) : (
                    <div className="delayed-table-container">
                      <table className="delayed-table">
                        <thead>
                          <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Room No</th>
                            <th>Place Visited</th>
                            <th>Exit Time</th>
                            <th>Expected Return</th>
                            <th>Actual Return</th>
                            <th>Delay Duration</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {delayedOutpasses.map((student) => (
                            <tr key={student._id} className={student.isCurrentlyDelayed ? 'currently-delayed' : ''}>
                              <td>{student.regNo}</td>
                              <td>{student.name}</td>
                              <td>{student.department}</td>
                              <td>{student.roomNo}</td>
                              <td>{student.placeOfVisit}</td>
                              <td>{formatDate(student.exitTime)}</td>
                              <td className="expected-time">{formatDate(student.expectedReturnTime)}</td>
                              <td className="actual-time">
                                {student.actualReturnTime 
                                  ? formatDate(student.actualReturnTime)
                                  : <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Still Out</span>
                                }
                              </td>
                              <td>
                                <span className={`delay-badge ${student.isCurrentlyDelayed ? 'delay-active' : 'delay-outpass'}`}>
                                  {student.isCurrentlyDelayed ? '🔴' : '⚠️'} {formatDuration(student.delayDuration)}
                                </span>
                              </td>
                              <td>
                                {student.isCurrentlyDelayed ? (
                                  <span className="status-badge-active-delayed">STILL OUT</span>
                                ) : (
                                  <span className="status-badge-returned">RETURNED</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'vacation' && (
                <div className="tab-content">
                  <div className="section-header">
                    <h3>🏖️ Vacation Permission Letter Delays</h3>
                    <p>Students whose PL arrival date has passed but haven't returned yet</p>
                  </div>

                  {delayedVacations.length === 0 ? (
                    <div className="empty-state">
                      <h3>No Delayed Vacation Returns</h3>
                      <p>All students on vacation have returned on time or are within their PL duration.</p>
                    </div>
                  ) : (
                    <div className="delayed-table-container">
                      <table className="delayed-table">
                        <thead>
                          <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Room No</th>
                            <th>Place of Visit</th>
                            <th>Departure Time</th>
                            <th>Expected Arrival</th>
                            <th>Exit Time</th>
                            <th>Delay Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {delayedVacations.map((student) => (
                            <tr key={student._id} className="vacation-delay-row">
                              <td>{student.regNo}</td>
                              <td>{student.name}</td>
                              <td>{student.department}</td>
                              <td>{student.roomNo}</td>
                              <td>{student.placeOfVisit}</td>
                              <td>{formatDate(student.departureDateTime)}</td>
                              <td className="expected-time">{formatDate(student.arrivalDateTime)}</td>
                              <td>{formatDate(student.exitTime)}</td>
                              <td>
                                <span className="delay-badge delay-vacation">
                                  🚨 {formatDuration(student.delayDuration)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelayedStudents;
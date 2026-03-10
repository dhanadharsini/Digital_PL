import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';
import './DelayedStudents.css';

const DelayedStudents = () => {
  const [delayedOutpasses, setDelayedOutpasses] = useState([]);
  const [delayedVacations, setDelayedVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outpass');
  const [lastUpdated, setLastUpdated] = useState(new Date());



  useEffect(() => {
    fetchDelayedData();

    // Auto-refresh delay calculations every minute
    const refreshInterval = setInterval(() => {
      setLastUpdated(new Date());
      // Re-fetch data to get updated delay calculations from backend
      fetchDelayedData();
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
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

  // Use backend-formatted timestamps when available, fallback to client-side formatting
  const formatDate = (date, formattedValue) => {
    // If backend provides pre-formatted value, use it
    if (formattedValue) {
      return formattedValue;
    }
    // Fallback to client-side formatting
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

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

  return (
    <DashboardLayout title="Delayed Students" menuItems={menuItems}>
      <div className="delayed-students-container">
        <div className="header-section">
          <h2>Delayed Students Tracking</h2>
          <p>Monitor students who have exceeded their allowed time limits</p>
        </div>

        {/* Tab Navigation */}
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
          <div className="tab-content">
            {/* Outpass Delays Tab */}
            {activeTab === 'outpass' && (
              <div>
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
                  <div className="table-container">
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
                            <td>{student.placeVisited}</td>
                            <td>
                              {formatDate(student.exitTime, student.exitTimeFormatted)}
                            </td>
                            <td className="expected-time">
                              {formatDate(student.expectedReturnTime, student.expectedReturnTimeFormatted)}
                            </td>
                            <td>
                              {student.actualReturnTime
                                ? formatDate(student.actualReturnTime, student.actualReturnTimeFormatted)
                                : <span className="actual-time">Still Out</span>
                              }
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <span className={`delay-badge ${student.isCurrentlyDelayed ? 'delay-active' : 'delay-outpass'}`}>
                                  {student.isCurrentlyDelayed ? '🔴' : '⚠️'} {formatDuration(student.delayDuration)}
                                </span>
                              </div>
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

            {/* Vacation Delays Tab */}
            {activeTab === 'vacation' && (
              <div>
                <div className="section-header">
                  <h3>🏖️ Vacation Permission Letter Delays</h3>
                  <p>Students whose PL arrival date has passed but haven't returned yet</p>
                  <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
                    Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                  </p>
                </div>

                {delayedVacations.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Delayed Vacation Returns</h3>
                    <p>All students on vacation have returned on time or are within their PL duration.</p>
                  </div>
                ) : (
                  <div className="table-container">
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
                          <tr key={student._id} className="vacation-delay-row currently-delayed">
                            <td>{student.regNo}</td>
                            <td>{student.name}</td>
                            <td>{student.department}</td>
                            <td>{student.roomNo}</td>
                            <td>{student.placeOfVisit}</td>
                            <td>{formatDate(student.departureDateTime)}</td>
                            <td className="actual-time" style={{ fontWeight: 'bold' }}>
                              {formatDate(student.arrivalDateTime, student.arrivalDateTimeFormatted)}
                            </td>
                            <td>
                              {formatDate(student.exitTime, student.exitTimeFormatted)}
                            </td>
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DelayedStudents;
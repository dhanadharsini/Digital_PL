import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';
import './WardenAttendance.css';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Attendance', path: '/warden/attendance' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' }
  ];

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isToday(dateString) {
    return dateString === getTodayDate();
  }

  function isPastDate(dateString) {
    const selected = new Date(dateString);
    const today = new Date(getTodayDate());
    return selected < today;
  }

  useEffect(() => {
    if (selectedDate) {
      fetchStudents();
    }
  }, [selectedDate]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/warden/attendance/students?date=${selectedDate}`);
      setStudents(response.data.students);

      // Initialize attendance state - Students on vacation default to absent
      const attendanceState = {};
      response.data.students.forEach(student => {
        // If student is on vacation ON THIS DATE, always mark as absent
        if (student.isOnVacation) {
          attendanceState[student._id] = 'absent';
        } else {
          attendanceState[student._id] = student.attendance?.status || 'present';
        }
      });
      setAttendance(attendanceState);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    // Only allow changes for today's date and students not on vacation
    if (!isToday(selectedDate)) {
      return;
    }

    setAttendance({
      ...attendance,
      [studentId]: status
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify it's today's date
    if (!isToday(selectedDate)) {
      alert('You can only mark attendance for today!');
      return;
    }

    setSaving(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: attendance[student._id]
      }));

      await api.post('/warden/attendance/mark', {
        date: selectedDate,
        attendanceData
      });

      alert('Attendance marked successfully!');
      fetchStudents(); // Refresh to show updated data
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics based on CURRENT attendance state (for selected date)
  const stats = {
    total: students.length,
    present: Object.values(attendance).filter(status => status === 'present').length,
    absent: Object.values(attendance).filter(status => status === 'absent').length,
    onVacation: students.filter(s => s.isOnVacation).length
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Mark Attendance" />

        {/* Statistics Panel - Shows counts for SELECTED DATE */}
        <div className="stats-panel">
          <div className="stat-card stat-total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-card stat-present">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <div className="stat-label">Present</div>
              <div className="stat-value">{stats.present}</div>
            </div>
          </div>
          <div className="stat-card stat-vacation">
            <div className="stat-icon">✈</div>
            <div className="stat-content">
              <div className="stat-label">On Vacation</div>
              <div className="stat-value">{stats.onVacation}</div>
            </div>
          </div>
        </div>

        <div className="card">
          {/* Date Selector with Warning */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontWeight: '600', fontSize: '16px' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
                style={{
                  padding: '10px',
                  border: '2px solid #3498db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
            </div>

            {/* Show warning if not today */}
            {!isToday(selectedDate) && (
              <div style={{
                padding: '12px 16px',
                background: isPastDate(selectedDate) ? '#fff3cd' : '#d1ecf1',
                border: `1px solid ${isPastDate(selectedDate) ? '#ffc107' : '#17a2b8'}`,
                borderRadius: '8px',
                color: isPastDate(selectedDate) ? '#856404' : '#0c5460',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {isPastDate(selectedDate) ? (
                  <>
                    ⚠️ <strong>View Only Mode:</strong> You are viewing past attendance. 
                    Only today's attendance can be marked or modified.
                  </>
                ) : (
                  <>
                    ℹ️ <strong>Note:</strong> Select today's date to mark attendance.
                  </>
                )}
              </div>
            )}

            {/* Show success message for today */}
            {isToday(selectedDate) && (
              <div style={{
                padding: '12px 16px',
                background: '#d4edda',
                border: '1px solid #28a745',
                borderRadius: '8px',
                color: '#155724',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ✓ <strong>Marking Today's Attendance:</strong> {new Date(selectedDate).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Reg No</th>
                      <th>Name</th>
                      <th>Room No</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.regNo}</td>
                        <td>{student.name}</td>
                        <td>{student.roomNo}</td>
                        <td>{student.department}</td>
                        <td>{student.yearOfStudy}</td>
                        <td>
                          {student.isOnVacation ? (
                            <span className="status-badge" style={{
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              ON VACATION
                            </span>
                          ) : (
                            <span className="status-badge" style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              IN HOSTEL
                            </span>
                          )}
                        </td>
                        <td>
                          {/* Show radio buttons ONLY for today's date */}
                          {isToday(selectedDate) ? (
                            // TODAY: Show interactive radio buttons (disabled for vacation students)
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                cursor: student.isOnVacation ? 'not-allowed' : 'pointer',
                                opacity: 1
                              }}>
                                <input
                                  type="radio"
                                  name={`attendance-${student._id}`}
                                  value="present"
                                  checked={attendance[student._id] === 'present'}
                                  onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                  disabled={student.isOnVacation}
                                  style={{ 
                                    cursor: student.isOnVacation ? 'not-allowed' : 'pointer',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                />
                                <span style={{ 
                                  color: '#28a745', 
                                  fontWeight: '700',
                                  fontSize: '14px'
                                }}>Present</span>
                              </label>
                              <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                cursor: student.isOnVacation ? 'not-allowed' : 'pointer',
                                opacity: 1
                              }}>
                                <input
                                  type="radio"
                                  name={`attendance-${student._id}`}
                                  value="absent"
                                  checked={attendance[student._id] === 'absent'}
                                  onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                                  disabled={student.isOnVacation}
                                  style={{ 
                                    cursor: student.isOnVacation ? 'not-allowed' : 'pointer',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                />
                                <span style={{ 
                                  color: '#dc3545', 
                                  fontWeight: '700',
                                  fontSize: '14px'
                                }}>Absent</span>
                              </label>
                            </div>
                          ) : (
                            // PAST DATES: Show text status only
                            <div style={{ display: 'flex', gap: '10px' }}>
                              {attendance[student._id] === 'present' ? (
                                <span style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#d4edda',
                                  color: '#155724',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  border: '1px solid #c3e6cb'
                                }}>
                                  ✓ Present
                                </span>
                              ) : (
                                <span style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#f8d7da',
                                  color: '#721c24',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  border: '1px solid #f5c6cb'
                                }}>
                                  ✗ Absent
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Only show submit button for today */}
              {isToday(selectedDate) && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ marginTop: '20px' }}
                >
                  {saving ? 'Saving...' : 'Mark Attendance'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
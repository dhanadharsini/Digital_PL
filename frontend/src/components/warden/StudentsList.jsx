import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');





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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.regNo.localeCompare(b.regNo, undefined, { numeric: true }));

  const menuItems = [
    { label: 'Dashboard', path: '/warden' },
    { label: 'Pending Requests', path: '/warden/pending-requests' },
    { label: 'Delayed Students', path: '/warden/delayed-students' },
    { label: 'QR Scanner', path: '/warden/qr-scanner' },
    { label: 'Students List', path: '/warden/students' },
    { label: 'Reports', path: '/warden/reports' }
  ];

  return (
    <DashboardLayout title="Students List" menuItems={menuItems}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        .status-badge {
          padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px);
          font-size: clamp(0.625rem, 1.5vw, 0.75rem);
          font-weight: 600;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pending {
          background-color: #f59e0b;
          color: white;
        }
        .status-parent-approved {
          background-color: #06b6d4;
          color: white;
        }
        .status-approved {
          background-color: #10b981;
          color: white;
        }
        :root {
          --card-bg: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          --card-border: #334155;
          --card-text: #e2e8f0;
          --table-border: #334155;
          --header-bg: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
        }
        .light-mode {
          --card-bg: #ffffff;
          --card-border: #e5e7eb;
          --card-text: #1f2937;
          --table-border: #e5e7eb;
          --header-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
      `}</style>
      <div className="card" style={{
        padding: 'clamp(16px, 4vw, 24px)',
        borderRadius: '12px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        color: 'var(--card-text)',
      }}>
        <div className="card-header-actions" style={{
          marginBottom: 'clamp(20px, 5vw, 24px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'clamp(12px, 3vw, 15px)',
          padding: '0 4px'
        }}>
          <div className="filter-box" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 2vw, 12px)',
            flexShrink: 0
          }}>
            <label style={{
              fontWeight: '600',
              color: 'var(--card-text)',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
            }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--card-border)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Students</option>
              <option value="in-hostel">In Hostel</option>
              <option value="on-vacation">On Vacation</option>
              <option value="on-outpass">On Outpass</option>
            </select>
          </div>
          <div className="search-box" style={{
            width: '100%',
            maxWidth: 'clamp(250px, 40vw, 350px)',
            flexShrink: 0
          }}>
            <input
              type="text"
              placeholder="Search by name, reg no or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                width: '100%',
                fontSize: '16px', /* Prevents zoom on iOS */
                backgroundColor: 'var(--card-bg)',
                color: 'var(--card-text)'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: 'clamp(40px, 10vw, 60px)',
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            color: 'var(--card-text)'
          }}>
            <div className="spinner" style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--card-border)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto 20px'
            }}></div>
            <div style={{
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Loading students...
            </div>
            <div style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#94a3b8',
              textAlign: 'center'
            }}>
              Please wait while we fetch the students list
            </div>
          </div>
        ) : (
          <div className="table-container" style={{
            overflowX: 'auto',
            borderRadius: '8px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--header-bg, linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%))',
                  color: 'white'
                }}>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Reg No</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Name</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Room No</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Year</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Department</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Mobile</th>
                  <th style={{
                    padding: 'clamp(10px, 2.5vw, 14px)',
                    textAlign: 'left',
                    fontWeight: '800',
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id} style={{
                    borderBottom: '1px solid var(--card-border)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.regNo}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.name}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.roomNo}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.yearOfStudy}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.department}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)',
                      color: 'var(--card-text)',
                      fontWeight: '500'
                    }}>{student.mobileNo}</td>
                    <td style={{
                      padding: 'clamp(12px, 3vw, 16px)'
                    }}>
                      <span className={`status-badge ${student.isOnVacation ? 'status-pending' :
                        student.isOnOutpass ? 'status-parent-approved' : // Cyan for outpass
                          'status-approved'
                        }`} style={{
                        fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                        padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
                        fontWeight: '600',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {student.isOnVacation ? 'ON VACATION' :
                          student.isOnOutpass ? 'ON OUTPASS' :
                            'IN HOSTEL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentsList;
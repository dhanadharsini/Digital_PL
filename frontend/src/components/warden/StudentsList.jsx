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
      <div className="card">
        <div className="card-header-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className="filter-box">
            <label style={{ marginRight: '10px', fontWeight: '600' }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="all">All Students</option>
              <option value="in-hostel">In Hostel</option>
              <option value="on-vacation">On Vacation</option>
              <option value="on-outpass">On Outpass</option>
            </select>
          </div>
          <div className="search-box" style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search by name, reg no or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                width: '100%'
              }}
            />
          </div>
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
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.regNo}</td>
                    <td>{student.name}</td>
                    <td>{student.roomNo}</td>
                    <td>{student.yearOfStudy}</td>
                    <td>{student.department}</td>
                    <td>{student.mobileNo}</td>
                    <td>
                      <span className={`status-badge ${student.isOnVacation ? 'status-pending' :
                        student.isOnOutpass ? 'status-parent-approved' : // Cyan for outpass
                          'status-approved'
                        }`}>
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
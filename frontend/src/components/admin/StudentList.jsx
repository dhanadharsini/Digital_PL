import { api, BASE_URL } from '../../services/api';
import DashboardLayout from '../common/DashboardLayout';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/admin/student/${id}`);
        fetchStudents();
      } catch (error) {
        alert('Failed to delete student');
      }
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditForm({
      regNo: student.regNo,
      name: student.name,
      email: student.email,
      mobileNo: student.mobileNo,
      yearOfStudy: student.yearOfStudy,
      department: student.department,
      hostelName: student.hostelName,
      roomNo: student.roomNo,
      parentName: student.parentName
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/student/${editingStudent._id}`, editForm);
      fetchStudents();
      setShowEditModal(false);
      setEditingStudent(null);
      alert('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      alert(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploadingPhoto(true);
    try {
      await api.post(`/admin/student/${editingStudent._id}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchStudents();
      alert('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.regNo.localeCompare(b.regNo, undefined, { numeric: true }));

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

  return (
    <DashboardLayout title="Students List" menuItems={menuItems}>
      <div className="card">
        <div className="card-header-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>Registered Students</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, reg no or dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                width: '100%',
                maxWidth: '300px'
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
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Year</th>
                  <th>Department</th>
                  <th>Hostel</th>
                  <th>Room No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student._id}>
                    <td>{student.regNo}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.mobileNo}</td>
                    <td>{student.yearOfStudy}</td>
                    <td>{student.department}</td>
                    <td>{student.hostelName}</td>
                    <td>{student.roomNo}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleEditClick(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(student._id)}
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <h3>Edit Student</h3>
            <form onSubmit={handleUpdateStudent}>
              <div className="form-group">
                <label>Registration No:</label>
                <input
                  type="text"
                  name="regNo"
                  value={editForm.regNo}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile No:</label>
                <input
                  type="text"
                  name="mobileNo"
                  value={editForm.mobileNo}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year of Study:</label>
                <input
                  type="number"
                  name="yearOfStudy"
                  value={editForm.yearOfStudy}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department:</label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hostel:</label>
                <input
                  type="text"
                  name="hostelName"
                  value={editForm.hostelName}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room No:</label>
                <input
                  type="text"
                  name="roomNo"
                  value={editForm.roomNo}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Parent Name:</label>
                <input
                  type="text"
                  name="parentName"
                  value={editForm.parentName}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Profile Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto && <p>Uploading...</p>}
                {editingStudent?.profilePhoto && (
                  <div style={{ marginTop: '10px' }}>
                    <p>Current Photo:</p>
                    <img
                      src={`${BASE_URL}${editingStudent.profilePhoto}`}
                      alt="Current"
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
              <div className="form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentList;
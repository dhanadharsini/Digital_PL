import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const WardenList = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWarden, setEditingWarden] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Add Student', path: '/admin/add-student' },
    { label: 'Add Parent', path: '/admin/add-parent' },
    { label: 'Add Warden', path: '/admin/add-warden' },
    { label: 'Students List', path: '/admin/students' },
    { label: 'Parents List', path: '/admin/parents' },
    { label: 'Wardens List', path: '/admin/wardens' }
  ];

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const response = await api.get('/admin/wardens');
      setWardens(response.data);
    } catch (error) {
      console.error('Error fetching wardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warden?')) {
      try {
        await api.delete(`/admin/warden/${id}`);
        fetchWardens();
      } catch (error) {
        alert('Failed to delete warden');
      }
    }
  };

  const handleEditClick = (warden) => {
    setEditingWarden(warden);
    setEditForm({
      wardenId: warden.wardenId,
      name: warden.name,
      email: warden.email,
      mobileNo: warden.mobileNo,
      hostelName: warden.hostelName
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

  const handleUpdateWarden = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/warden/${editingWarden._id}`, editForm);
      fetchWardens();
      setShowEditModal(false);
      setEditingWarden(null);
      alert('Warden updated successfully');
    } catch (error) {
      console.error('Error updating warden:', error);
      alert(error.response?.data?.message || 'Failed to update warden');
    }
  };

  const filteredWardens = wardens.filter(warden =>
    warden.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warden.wardenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warden.hostelName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.wardenId.localeCompare(b.wardenId, undefined, { numeric: true }));

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Wardens List" />

        <div className="card">
          <div className="card-header-actions" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Registered Wardens</h2>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, ID or hostel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  width: '300px'
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
                    <th>Warden ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Hostel Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWardens.map((warden) => (
                    <tr key={warden._id}>
                      <td>{warden.wardenId}</td>
                      <td>{warden.name}</td>
                      <td>{warden.email}</td>
                      <td>{warden.mobileNo}</td>
                      <td>{warden.hostelName}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleEditClick(warden)}
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(warden._id)}
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
            <h3>Edit Warden</h3>
            <form onSubmit={handleUpdateWarden}>
              <div className="form-group">
                <label>Warden ID:</label>
                <input
                  type="text"
                  name="wardenId"
                  value={editForm.wardenId}
                  readOnly
                  disabled
                  className="readonly-input"
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
                <label>Hostel Name:</label>
                <input
                  type="text"
                  name="hostelName"
                  value={editForm.hostelName}
                  onChange={handleEditChange}
                  required
                />
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
    </div>
  );
};

export default WardenList;
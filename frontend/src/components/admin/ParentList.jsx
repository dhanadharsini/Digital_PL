import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';
import { api } from '../../services/api';

const ParentList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingParent, setEditingParent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

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
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('/admin/parents');
      setParents(response.data);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        await api.delete(`/admin/parent/${id}`);
        fetchParents();
      } catch (error) {
        alert('Failed to delete parent');
      }
    }
  };

  const handleEditClick = (parent) => {
    setEditingParent(parent);
    setEditForm({
      parentId: parent.parentId,
      name: parent.name,
      email: parent.email,
      mobileNo: parent.mobileNo,
      studentName: parent.studentName,
      studentRegNo: parent.studentRegNo
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

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/parent/${editingParent._id}`, editForm);
      fetchParents();
      setShowEditModal(false);
      setEditingParent(null);
      alert('Parent updated successfully');
    } catch (error) {
      console.error('Error updating parent:', error);
      alert(error.response?.data?.message || 'Failed to update parent');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <div className="main-content">
        <Navbar title="Parents List" />
        
        <div className="card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Parent ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Student Name</th>
                    <th>Student Reg No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map((parent) => (
                    <tr key={parent._id}>
                      <td>{parent.parentId}</td>
                      <td>{parent.name}</td>
                      <td>{parent.email}</td>
                      <td>{parent.mobileNo}</td>
                      <td>{parent.studentName}</td>
                      <td>{parent.studentRegNo}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleEditClick(parent)}
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDelete(parent._id)}
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
            <h3>Edit Parent</h3>
            <form onSubmit={handleUpdateParent}>
              <div className="form-group">
                <label>Parent ID:</label>
                <input
                  type="text"
                  name="parentId"
                  value={editForm.parentId}
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
                <label>Student Name:</label>
                <input
                  type="text"
                  name="studentName"
                  value={editForm.studentName}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Student Reg No:</label>
                <input
                  type="text"
                  name="studentRegNo"
                  value={editForm.studentRegNo}
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

export default ParentList;
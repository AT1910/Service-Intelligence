import React, { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/services/api';

function Staff() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: 'server',
    hourly_rate: 15.00
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
      } else {
        await createStaff(formData);
      }
      loadStaff();
      closeModal();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error saving staff member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        loadStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const openModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        position: staffMember.position,
        hourly_rate: staffMember.hourly_rate
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        position: 'server',
        hourly_rate: 15.00
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const getPositionIcon = (position) => {
    const icons = {
      server: '🍽️',
      host: '💬',
      bartender: '🍸',
      chef: '👨‍🍳',
      manager: '💼'
    };
    return icons[position] || '👤';
  };

  return (
    <div className="space-y-6 fade-in" data-testid="staff-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">👨‍🍳 Staff Management</h1>
        <button 
          onClick={() => openModal()} 
          className="btn btn-primary"
          data-testid="add-staff-btn"
        >
          + Add Staff Member
        </button>
      </div>

      <div className="card">
        {staff.length === 0 ? (
          <div className="text-center py-12" data-testid="no-staff-message">
            <span className="text-6xl mb-4 block">👨‍🍳</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Staff Members Found</h3>
            <p className="text-slate-500">Add your first staff member to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <div 
                key={member.id} 
                className="card bg-white border border-slate-200 hover:shadow-lg transition-shadow"
                data-testid={`staff-card-${member.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getPositionIcon(member.position)}</span>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                      <p className="text-sm text-slate-600 capitalize">{member.position}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Hourly Rate:</span>
                    <span className="font-semibold text-green-600">${member.hourly_rate.toFixed(2)}/hr</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(member)}
                    className="flex-1 btn btn-secondary text-sm"
                    data-testid={`edit-staff-${member.id}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="flex-1 btn btn-danger text-sm"
                    data-testid={`delete-staff-${member.id}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="staff-modal">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    required
                    data-testid="name-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="form-select"
                    required
                    data-testid="position-select"
                  >
                    <option value="server">Server</option>
                    <option value="host">Host</option>
                    <option value="bartender">Bartender</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})}
                    className="form-input"
                    required
                    data-testid="hourly-rate-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-staff-btn">
                  {editingStaff ? 'Update' : 'Create'} Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;

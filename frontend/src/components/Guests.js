import React, { useState, useEffect } from 'react';
import { getGuests, createGuest, updateGuest, deleteGuest } from '@/services/api';

function Guests() {
  const [guests, setGuests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    total_visits: 0,
    total_spend: 0,
    preferences: '',
    vip_status: false,
    last_visit: '',
    notes: ''
  });

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, formData);
      } else {
        await createGuest(formData);
      }
      loadGuests();
      closeModal();
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Error saving guest');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await deleteGuest(id);
        loadGuests();
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const openModal = (guest = null) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        name: guest.name,
        phone: guest.phone || '',
        email: guest.email || '',
        total_visits: guest.total_visits,
        total_spend: guest.total_spend,
        preferences: guest.preferences || '',
        vip_status: guest.vip_status,
        last_visit: guest.last_visit || '',
        notes: guest.notes || ''
      });
    } else {
      setEditingGuest(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        total_visits: 0,
        total_spend: 0,
        preferences: '',
        vip_status: false,
        last_visit: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGuest(null);
  };

  return (
    <div className="space-y-6 fade-in" data-testid="guests-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">👥 Guest Management</h1>
        <button 
          onClick={() => openModal()} 
          className="btn btn-primary"
          data-testid="add-guest-btn"
        >
          + Add Guest
        </button>
      </div>

      <div className="card">
        {guests.length === 0 ? (
          <div className="text-center py-12" data-testid="no-guests-message">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Guests Found</h3>
            <p className="text-slate-500">Add your first guest to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table" data-testid="guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Total Visits</th>
                  <th>Total Spend</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} data-testid={`guest-row-${guest.id}`}>
                    <td className="font-medium">{guest.name}</td>
                    <td className="text-sm">
                      {guest.phone && <div>📞 {guest.phone}</div>}
                      {guest.email && <div>✉️ {guest.email}</div>}
                    </td>
                    <td>{guest.total_visits}</td>
                    <td>${guest.total_spend.toFixed(2)}</td>
                    <td>{guest.last_visit || '-'}</td>
                    <td>
                      {guest.vip_status && (
                        <span className="badge badge-warning">⭐ VIP</span>
                      )}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(guest)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          data-testid={`edit-guest-${guest.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          data-testid={`delete-guest-${guest.id}`}
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="guest-modal">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-input"
                      data-testid="phone-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      data-testid="email-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Total Visits</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.total_visits}
                      onChange={(e) => setFormData({...formData, total_visits: parseInt(e.target.value) || 0})}
                      className="form-input"
                      data-testid="visits-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Spend ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_spend}
                      onChange={(e) => setFormData({...formData, total_spend: parseFloat(e.target.value) || 0})}
                      className="form-input"
                      data-testid="spend-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Visit Date</label>
                  <input
                    type="date"
                    value={formData.last_visit}
                    onChange={(e) => setFormData({...formData, last_visit: e.target.value})}
                    className="form-input"
                    data-testid="last-visit-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferences</label>
                  <textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                    className="form-textarea"
                    placeholder="Dietary restrictions, favorite dishes, etc."
                    data-testid="preferences-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-textarea"
                    placeholder="Any additional information"
                    data-testid="notes-input"
                  />
                </div>
                <div className="form-group">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.vip_status}
                      onChange={(e) => setFormData({...formData, vip_status: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      data-testid="vip-checkbox"
                    />
                    <span className="font-medium text-slate-700">⭐ VIP Status</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-guest-btn">
                  {editingGuest ? 'Update' : 'Create'} Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Guests;

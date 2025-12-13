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
    if (window.confirm('Remove this guest from your records?')) {
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

  const vipGuests = guests.filter(g => g.vip_status).length;
  const totalLifetimeValue = guests.reduce((sum, g) => sum + g.total_spend, 0);

  return (
    <div className="space-y-6 fade-in" data-testid="guests-page">
      <div className="page-header">
        <h1 className="page-title">Guest Relations</h1>
        <p className="page-subtitle">Building lasting relationships through enlightened hospitality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="metric-card">
          <p className="metric-label" style={{color: 'var(--color-primary)'}}>Total Guests</p>
          <p className="metric-value" style={{color: 'var(--color-primary-dark)'}}>{guests.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label" style={{color: '#FFD700'}}>VIP Guests</p>
          <p className="metric-value" style={{color: '#B8860B'}}>{vipGuests}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label" style={{color: 'var(--color-success)'}}>Lifetime Value</p>
          <p className="metric-value" style={{color: 'var(--color-success)'}}>${totalLifetimeValue.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold" style={{color: 'var(--color-text)'}}>Guest Directory</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="btn btn-accent"
          data-testid="add-guest-btn"
        >
          ➕ Add Guest
        </button>
      </div>

      <div className="card" style={{padding: 0}}>
        {guests.length === 0 ? (
          <div className="empty-state" data-testid="no-guests-message">
            <span className="empty-icon">🤝</span>
            <h3 className="empty-title">Build Your Guest Community</h3>
            <p className="empty-description">Start creating guest profiles to personalize their experience</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table" data-testid="guests-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Contact</th>
                  <th>Visits</th>
                  <th>Lifetime Spend</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} data-testid={`guest-row-${guest.id}`}>
                    <td>
                      <div className="font-semibold" style={{color: 'var(--color-primary-dark)'}}>
                        {guest.name}
                        {guest.vip_status && <span className="ml-2">⭐</span>}
                      </div>
                    </td>
                    <td className="text-sm">
                      {guest.phone && <div>📞 {guest.phone}</div>}
                      {guest.email && <div>✉️ {guest.email}</div>}
                    </td>
                    <td>
                      <span className="font-semibold">{guest.total_visits}</span>
                    </td>
                    <td>
                      <span className="font-semibold" style={{color: 'var(--color-success)'}}>
                        ${guest.total_spend.toFixed(2)}
                      </span>
                    </td>
                    <td>{guest.last_visit || '—'}</td>
                    <td>
                      {guest.vip_status && (
                        <span className="badge badge-vip">⭐ VIP</span>
                      )}
                      {!guest.vip_status && guest.total_visits > 5 && (
                        <span className="badge badge-success">Regular</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(guest)}
                          className="text-sm font-semibold"
                          style={{color: 'var(--color-primary)'}}
                          data-testid={`edit-guest-${guest.id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="text-sm font-semibold"
                          style={{color: 'var(--color-danger)'}}
                          data-testid={`delete-guest-${guest.id}`}
                        >
                          🗑️ Remove
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
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-primary-dark)'}}>
                {editingGuest ? 'Update Guest Profile' : 'Add New Guest'}
              </h2>
              <p className="text-sm mt-1" style={{color: 'var(--color-text-secondary)'}}>
                Capturing details to personalize their experience
              </p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Guest Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    required
                    placeholder="Enter guest's full name"
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
                      placeholder="555-0123"
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
                      placeholder="guest@example.com"
                      data-testid="email-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
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
                    <label className="form-label">Lifetime Spend ($)</label>
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
                  <div className="form-group">
                    <label className="form-label">Last Visit</label>
                    <input
                      type="date"
                      value={formData.last_visit}
                      onChange={(e) => setFormData({...formData, last_visit: e.target.value})}
                      className="form-input"
                      data-testid="last-visit-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferences & Dietary Restrictions</label>
                  <textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                    className="form-textarea"
                    placeholder="Allergies, favorite dishes, seating preferences..."
                    data-testid="preferences-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-textarea"
                    placeholder="Special occasions, VIP connections, service notes..."
                    data-testid="notes-input"
                  />
                </div>
                <div className="form-group">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg" style={{background: 'var(--color-accent-light)'}}>
                    <input
                      type="checkbox"
                      checked={formData.vip_status}
                      onChange={(e) => setFormData({...formData, vip_status: e.target.checked})}
                      className="w-5 h-5"
                      data-testid="vip-checkbox"
                    />
                    <span className="font-semibold" style={{color: 'var(--color-primary-dark)'}}>
                      ⭐ VIP Status (Special attention & recognition)
                    </span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" data-testid="save-guest-btn">
                  {editingGuest ? '💾 Update' : '➕ Add'} Guest
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

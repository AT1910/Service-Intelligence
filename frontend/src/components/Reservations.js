import React, { useState, useEffect } from 'react';
import { getReservations, createReservation, updateReservation, deleteReservation, getGuests } from '@/services/api';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    guest_id: '',
    guest_name: '',
    service_date: '',
    time: '',
    party_size: 2,
    notes: '',
    status: 'confirmed'
  });

  useEffect(() => {
    loadReservations();
    loadGuests();
  }, [filterDate]);

  const loadReservations = async () => {
    try {
      const data = await getReservations(filterDate || null);
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

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
      if (editingReservation) {
        await updateReservation(editingReservation.id, formData);
      } else {
        await createReservation(formData);
      }
      loadReservations();
      closeModal();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error saving reservation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteReservation(id);
        loadReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
  };

  const openModal = (reservation = null) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        guest_id: reservation.guest_id,
        guest_name: reservation.guest_name,
        service_date: reservation.service_date,
        time: reservation.time,
        party_size: reservation.party_size,
        notes: reservation.notes || '',
        status: reservation.status
      });
    } else {
      setEditingReservation(null);
      setFormData({
        guest_id: '',
        guest_name: '',
        service_date: '',
        time: '',
        party_size: 2,
        notes: '',
        status: 'confirmed'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReservation(null);
  };

  const handleGuestSelect = (e) => {
    const guestId = e.target.value;
    const guest = guests.find(g => g.id === guestId);
    setFormData({
      ...formData,
      guest_id: guestId,
      guest_name: guest ? guest.name : ''
    });
  };

  return (
    <div className="space-y-6 fade-in" data-testid="reservations-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">📅 Reservations</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Filter by date"
            className="form-input"
            data-testid="filter-date-input"
          />
          <button 
            onClick={() => openModal()} 
            className="btn btn-primary"
            data-testid="add-reservation-btn"
          >
            + Add Reservation
          </button>
        </div>
      </div>

      <div className="card">
        {reservations.length === 0 ? (
          <div className="text-center py-12" data-testid="no-reservations-message">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reservations Found</h3>
            <p className="text-slate-500">Add your first reservation to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table" data-testid="reservations-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Party Size</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} data-testid={`reservation-row-${reservation.id}`}>
                    <td className="font-medium">{reservation.guest_name}</td>
                    <td>{reservation.service_date}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.party_size}</td>
                    <td>
                      <span className={`badge ${
                        reservation.status === 'confirmed' ? 'badge-success' :
                        reservation.status === 'cancelled' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{reservation.notes || '-'}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(reservation)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          data-testid={`edit-reservation-${reservation.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          data-testid={`delete-reservation-${reservation.id}`}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="reservation-modal">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingReservation ? 'Edit Reservation' : 'Add New Reservation'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Guest *</label>
                  <select
                    value={formData.guest_id}
                    onChange={handleGuestSelect}
                    className="form-select"
                    required
                    data-testid="guest-select"
                  >
                    <option value="">Select a guest</option>
                    {guests.map(guest => (
                      <option key={guest.id} value={guest.id}>{guest.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Service Date *</label>
                  <input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                    className="form-input"
                    required
                    data-testid="service-date-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="form-input"
                    required
                    data-testid="time-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Party Size *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.party_size}
                    onChange={(e) => setFormData({...formData, party_size: parseInt(e.target.value)})}
                    className="form-input"
                    required
                    data-testid="party-size-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="form-select"
                    required
                    data-testid="status-select"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-textarea"
                    placeholder="Special requests, dietary restrictions, etc."
                    data-testid="notes-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-reservation-btn">
                  {editingReservation ? 'Update' : 'Create'} Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;

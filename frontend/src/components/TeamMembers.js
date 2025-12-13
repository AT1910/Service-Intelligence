import React, { useState, useEffect } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/services/api';

function TeamMembers() {
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: 'server',
    hourly_rate: 18.00
  });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const data = await getStaff();
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await updateStaff(editingMember.id, formData);
      } else {
        await createStaff(formData);
      }
      loadTeam();
      closeModal();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Error saving team member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this team member from the roster?')) {
      try {
        await deleteStaff(id);
        loadTeam();
      } catch (error) {
        console.error('Error removing team member:', error);
      }
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        position: member.position,
        hourly_rate: member.hourly_rate
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        position: 'server',
        hourly_rate: 18.00
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  const getPositionDisplay = (position) => {
    const positions = {
      server: { icon: '🍽️', label: 'Server', color: '#8B4513' },
      host: { icon: '🎯', label: 'Host', color: '#2D5016' },
      bartender: { icon: '🍸', label: 'Bartender', color: '#7851A9' },
      chef: { icon: '👨‍🍳', label: 'Chef', color: '#C41E3A' },
      manager: { icon: '💼', label: 'Manager', color: '#1A4D8B' }
    };
    return positions[position] || positions.server;
  };

  return (
    <div className="space-y-6 fade-in" data-testid="team-page">
      <div className="page-header">
        <h1 className="page-title">Team & Hospitality</h1>
        <p className="page-subtitle">Our team members are the heart of enlightened hospitality</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold" style={{color: 'var(--color-text)'}}>Team Roster</p>
          <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>{team.length} team members</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="btn btn-accent"
          data-testid="add-team-btn"
        >
          ➕ Add Team Member
        </button>
      </div>

      <div className="card" style={{padding: '0'}}>
        {team.length === 0 ? (
          <div className="empty-state" data-testid="no-team-message">
            <span className="empty-icon">👥</span>
            <h3 className="empty-title">Build Your Team</h3>
            <p className="empty-description">Add team members to start scheduling and building your hospitality roster</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {team.map((member) => {
              const positionInfo = getPositionDisplay(member.position);
              return (
                <div 
                  key={member.id} 
                  className="metric-card"
                  data-testid={`team-card-${member.id}`}
                  style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF9F6 100%)'}}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span style={{fontSize: '2.5rem'}}>{positionInfo.icon}</span>
                      <div>
                        <h3 className="font-bold text-xl" style={{color: 'var(--color-primary-dark)'}}>{member.name}</h3>
                        <p className="text-sm font-semibold" style={{color: positionInfo.color}}>{positionInfo.label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 p-3 rounded-lg" style={{background: 'var(--color-accent-light)'}}>
                    <p className="text-sm font-medium" style={{color: 'var(--color-text-secondary)'}}>Hourly Rate</p>
                    <p className="text-2xl font-bold" style={{color: 'var(--color-primary-dark)'}}>${member.hourly_rate.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(member)}
                      className="flex-1 btn btn-secondary"
                      style={{fontSize: '0.875rem', padding: '0.625rem'}}
                      data-testid={`edit-team-${member.id}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="flex-1 btn"
                      style={{fontSize: '0.875rem', padding: '0.625rem', background: 'var(--color-danger)', color: 'white'}}
                      data-testid={`delete-team-${member.id}`}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="team-modal">
            <div className="modal-header">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-primary-dark)'}}>
                {editingMember ? 'Update Team Member' : 'Add Team Member'}
              </h2>
              <p className="text-sm mt-1" style={{color: 'var(--color-text-secondary)'}}>Building our hospitality team</p>
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
                    placeholder="Enter team member's name"
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
                    <option value="server">🍽️ Server</option>
                    <option value="host">🎯 Host</option>
                    <option value="bartender">🍸 Bartender</option>
                    <option value="chef">👨‍🍳 Chef</option>
                    <option value="manager">💼 Manager</option>
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
                    placeholder="18.00"
                    data-testid="hourly-rate-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" data-testid="save-team-btn">
                  {editingMember ? '💾 Update Member' : '➕ Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMembers;

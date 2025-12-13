import React, { useState, useEffect } from 'react';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getStaff, getServiceConfig, createServiceConfig, updateServiceConfig } from '@/services/api';

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [serviceConfig, setServiceConfig] = useState(null);
  const [formData, setFormData] = useState({
    staff_id: '',
    staff_name: '',
    position: '',
    service_date: '',
    shift_start: '',
    shift_end: '',
    scheduled_hours: 0,
    hourly_rate: 0,
    notes: ''
  });
  const [configData, setConfigData] = useState({
    service_date: '',
    expected_walk_in_min: 0,
    expected_walk_in_max: 0,
    peak_time_start: '',
    peak_time_end: '',
    notes: ''
  });

  useEffect(() => {
    loadSchedules();
    loadStaff();
  }, [filterDate]);

  useEffect(() => {
    if (filterDate) {
      loadServiceConfig();
    }
  }, [filterDate]);

  const loadSchedules = async () => {
    try {
      const data = await getSchedules(filterDate || null);
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadServiceConfig = async () => {
    try {
      const config = await getServiceConfig(filterDate);
      setServiceConfig(config);
      if (config) {
        setConfigData({
          service_date: config.service_date,
          expected_walk_in_min: config.expected_walk_in_min || 0,
          expected_walk_in_max: config.expected_walk_in_max || 0,
          peak_time_start: config.peak_time_start || '',
          peak_time_end: config.peak_time_end || '',
          notes: config.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading service config:', error);
    }
  };

  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return ((endMinutes - startMinutes) / 60).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hours = calculateHours(formData.shift_start, formData.shift_end);
      const scheduleData = { ...formData, scheduled_hours: parseFloat(hours) };
      
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }
      loadSchedules();
      closeModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule');
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      if (serviceConfig) {
        await updateServiceConfig(configData.service_date, configData);
      } else {
        await createServiceConfig(configData);
      }
      loadServiceConfig();
      setShowConfigModal(false);
    } catch (error) {
      console.error('Error saving service config:', error);
      alert('Error saving service configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id);
        loadSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const openModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        staff_id: schedule.staff_id,
        staff_name: schedule.staff_name,
        position: schedule.position,
        service_date: schedule.service_date,
        shift_start: schedule.shift_start,
        shift_end: schedule.shift_end,
        scheduled_hours: schedule.scheduled_hours,
        hourly_rate: schedule.hourly_rate,
        notes: schedule.notes || ''
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        staff_id: '',
        staff_name: '',
        position: '',
        service_date: filterDate || '',
        shift_start: '',
        shift_end: '',
        scheduled_hours: 0,
        hourly_rate: 0,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleStaffSelect = (e) => {
    const staffId = e.target.value;
    const selectedStaff = staff.find(s => s.id === staffId);
    if (selectedStaff) {
      setFormData({
        ...formData,
        staff_id: staffId,
        staff_name: selectedStaff.name,
        position: selectedStaff.position,
        hourly_rate: selectedStaff.hourly_rate
      });
    }
  };

  const openConfigModal = () => {
    setConfigData({
      service_date: filterDate || '',
      expected_walk_in_min: serviceConfig?.expected_walk_in_min || 0,
      expected_walk_in_max: serviceConfig?.expected_walk_in_max || 0,
      peak_time_start: serviceConfig?.peak_time_start || '',
      peak_time_end: serviceConfig?.peak_time_end || '',
      notes: serviceConfig?.notes || ''
    });
    setShowConfigModal(true);
  };

  const totalHours = schedules.reduce((sum, s) => sum + s.scheduled_hours, 0);
  const totalCost = schedules.reduce((sum, s) => sum + (s.scheduled_hours * s.hourly_rate), 0);

  return (
    <div className="space-y-6 fade-in" data-testid="schedules-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">🕐 Staff Schedules</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Filter by date"
            className="form-input"
            data-testid="filter-date-input"
          />
          {filterDate && (
            <button 
              onClick={openConfigModal} 
              className="btn btn-secondary"
              data-testid="config-service-btn"
            >
              ⚙️ Service Config
            </button>
          )}
          <button 
            onClick={() => openModal()} 
            className="btn btn-primary"
            data-testid="add-schedule-btn"
          >
            + Add Schedule
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-sm font-medium text-blue-600">Total Staff</p>
            <p className="text-3xl font-bold text-blue-900">{schedules.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <p className="text-sm font-medium text-green-600">Total Hours</p>
            <p className="text-3xl font-bold text-green-900">{totalHours.toFixed(1)}</p>
          </div>
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
            <p className="text-sm font-medium text-orange-600">Labor Cost</p>
            <p className="text-3xl font-bold text-orange-900">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="card">
        {schedules.length === 0 ? (
          <div className="text-center py-12" data-testid="no-schedules-message">
            <span className="text-6xl mb-4 block">🕐</span>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Schedules Found</h3>
            <p className="text-slate-500">Add your first schedule to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table" data-testid="schedules-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Position</th>
                  <th>Date</th>
                  <th>Shift Time</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} data-testid={`schedule-row-${schedule.id}`}>
                    <td className="font-medium">{schedule.staff_name}</td>
                    <td className="capitalize">{schedule.position}</td>
                    <td>{schedule.service_date}</td>
                    <td>{schedule.shift_start} - {schedule.shift_end}</td>
                    <td>{schedule.scheduled_hours.toFixed(1)}h</td>
                    <td>${schedule.hourly_rate.toFixed(2)}/h</td>
                    <td className="font-semibold text-green-600">
                      ${(schedule.scheduled_hours * schedule.hourly_rate).toFixed(2)}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(schedule)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          data-testid={`edit-schedule-${schedule.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          data-testid={`delete-schedule-${schedule.id}`}
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

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="schedule-modal">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Staff Member *</label>
                  <select
                    value={formData.staff_id}
                    onChange={handleStaffSelect}
                    className="form-select"
                    required
                    data-testid="staff-select"
                  >
                    <option value="">Select staff member</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.position}
                      </option>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Shift Start *</label>
                    <input
                      type="time"
                      value={formData.shift_start}
                      onChange={(e) => setFormData({...formData, shift_start: e.target.value})}
                      className="form-input"
                      required
                      data-testid="shift-start-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shift End *</label>
                    <input
                      type="time"
                      value={formData.shift_end}
                      onChange={(e) => setFormData({...formData, shift_end: e.target.value})}
                      className="form-input"
                      required
                      data-testid="shift-end-input"
                    />
                  </div>
                </div>
                {formData.shift_start && formData.shift_end && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Calculated Hours:</strong> {calculateHours(formData.shift_start, formData.shift_end)} hours
                    </p>
                    {formData.hourly_rate > 0 && (
                      <p className="text-sm text-blue-700">
                        <strong>Estimated Cost:</strong> ${(calculateHours(formData.shift_start, formData.shift_end) * formData.hourly_rate).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-textarea"
                    placeholder="Special instructions or notes"
                    data-testid="notes-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" data-testid="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-schedule-btn">
                  {editingSchedule ? 'Update' : 'Create'} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Config Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="config-modal">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Service Configuration</h2>
              <p className="text-sm text-slate-500 mt-1">Configure expected walk-ins and peak times</p>
            </div>
            <form onSubmit={handleConfigSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Service Date *</label>
                  <input
                    type="date"
                    value={configData.service_date}
                    onChange={(e) => setConfigData({...configData, service_date: e.target.value})}
                    className="form-input"
                    required
                    disabled={!!serviceConfig}
                    data-testid="config-date-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Min Walk-ins</label>
                    <input
                      type="number"
                      min="0"
                      value={configData.expected_walk_in_min}
                      onChange={(e) => setConfigData({...configData, expected_walk_in_min: parseInt(e.target.value) || 0})}
                      className="form-input"
                      data-testid="walk-in-min-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Walk-ins</label>
                    <input
                      type="number"
                      min="0"
                      value={configData.expected_walk_in_max}
                      onChange={(e) => setConfigData({...configData, expected_walk_in_max: parseInt(e.target.value) || 0})}
                      className="form-input"
                      data-testid="walk-in-max-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Peak Time Start</label>
                    <input
                      type="time"
                      value={configData.peak_time_start}
                      onChange={(e) => setConfigData({...configData, peak_time_start: e.target.value})}
                      className="form-input"
                      data-testid="peak-start-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Peak Time End</label>
                    <input
                      type="time"
                      value={configData.peak_time_end}
                      onChange={(e) => setConfigData({...configData, peak_time_end: e.target.value})}
                      className="form-input"
                      data-testid="peak-end-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={configData.notes}
                    onChange={(e) => setConfigData({...configData, notes: e.target.value})}
                    className="form-textarea"
                    placeholder="Additional service notes"
                    data-testid="config-notes-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowConfigModal(false)} className="btn btn-secondary" data-testid="cancel-config-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="save-config-btn">
                  {serviceConfig ? 'Update' : 'Create'} Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedules;

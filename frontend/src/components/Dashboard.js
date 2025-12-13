import React, { useState, useEffect } from 'react';
import { generateBriefing, getReservations, getSchedules, getServiceConfig } from '@/services/api';

function Dashboard() {
  const [serviceDate, setServiceDate] = useState(getTodayDate());
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    loadMetrics();
  }, [serviceDate]);

  const loadMetrics = async () => {
    try {
      const [reservations, schedules, config] = await Promise.all([
        getReservations(serviceDate),
        getSchedules(serviceDate),
        getServiceConfig(serviceDate).catch(() => null)
      ]);

      const totalCovers = reservations.reduce((sum, r) => sum + r.party_size, 0);
      const totalHours = schedules.reduce((sum, s) => sum + s.scheduled_hours, 0);
      const totalCost = schedules.reduce((sum, s) => sum + (s.scheduled_hours * s.hourly_rate), 0);

      setMetrics({
        reservations: reservations.length,
        totalCovers,
        staffScheduled: schedules.length,
        totalHours: totalHours.toFixed(1),
        laborCost: totalCost.toFixed(2),
        walkInMin: config?.expected_walk_in_min || 0,
        walkInMax: config?.expected_walk_in_max || 0
      });
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const handleGenerateBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBriefing(serviceDate);
      setBriefing(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error generating briefing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in" data-testid="dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Operations Dashboard</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Service Date:</label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="form-input"
            data-testid="service-date-picker"
          />
          <button
            onClick={handleGenerateBriefing}
            disabled={loading}
            className="btn btn-primary"
            data-testid="generate-briefing-btn"
          >
            {loading ? 'Generating...' : '📝 Generate Briefing'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Reservations</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.reservations}</p>
                <p className="text-xs text-blue-700 mt-1">{metrics.totalCovers} covers</p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Expected Guests</p>
                <p className="text-3xl font-bold text-green-900">
                  {metrics.totalCovers + metrics.walkInMin}-{metrics.totalCovers + metrics.walkInMax}
                </p>
                <p className="text-xs text-green-700 mt-1">Including walk-ins</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Staff Scheduled</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.staffScheduled}</p>
                <p className="text-xs text-purple-700 mt-1">{metrics.totalHours} total hours</p>
              </div>
              <span className="text-4xl">👨‍🍳</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Labor Cost</p>
                <p className="text-3xl font-bold text-orange-900">${metrics.laborCost}</p>
                <p className="text-xs text-orange-700 mt-1">Estimated</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Display */}
      {error && (
        <div className="card bg-red-50 border border-red-200" data-testid="briefing-error">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {briefing && (
        <div className="card" data-testid="briefing-display">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">📊 Service Intelligence</h2>
            <span className="text-sm text-slate-500">
              Generated: {new Date(briefing.generated_at).toLocaleString()}
            </span>
          </div>
          <div className="prose max-w-none">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                {briefing.briefing_text}
              </pre>
            </div>
          </div>
        </div>
      )}

      {!briefing && !loading && (
        <div className="card text-center py-12" data-testid="no-briefing-message">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No Briefing Generated
          </h3>
          <p className="text-slate-500 mb-4">
            Select a service date and click "Generate Briefing" to create your operational intelligence report.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

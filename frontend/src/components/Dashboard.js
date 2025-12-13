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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className=\"space-y-6 fade-in\" data-testid=\"dashboard\">
      <div className=\"page-header\">
        <h1 className=\"page-title\">Service Intelligence</h1>
        <p className=\"page-subtitle\">Pre-shift operational briefing for enlightened hospitality</p>
      </div>

      <div className=\"flex items-center justify-between bg-white p-6 rounded-2xl shadow-md border-2 border-amber-100\">
        <div>
          <p className=\"text-sm font-semibold text-amber-800 uppercase tracking-wider mb-1\">Service Date</p>
          <p className=\"text-2xl font-bold\" style={{color: 'var(--color-primary-dark)'}}>{formatDate(serviceDate)}</p>
        </div>
        <div className=\"flex items-center gap-4\">
          <input
            type=\"date\"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className=\"form-input\"
            style={{maxWidth: '200px'}}
            data-testid=\"service-date-picker\"
          />
          <button
            onClick={handleGenerateBriefing}
            disabled={loading}
            className=\"btn btn-accent\"
            data-testid=\"generate-briefing-btn\"
          >
            {loading ? '✨ Generating...' : '✨ Generate Intelligence'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
          <div className=\"metric-card\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex-1\">
                <p className=\"metric-label\" style={{color: '#8B4513'}}>Tonight's Tables</p>
                <p className=\"metric-value\" style={{color: '#654321'}}>{metrics.reservations}</p>
                <p className=\"metric-detail\">{metrics.totalCovers} covers booked</p>
              </div>
              <span className=\"metric-icon\">📖</span>
            </div>
          </div>

          <div className=\"metric-card\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex-1\">
                <p className=\"metric-label\" style={{color: '#2D5016'}}>Expected Guests</p>
                <p className=\"metric-value\" style={{color: '#1A3A0E'}}>
                  {metrics.totalCovers + metrics.walkInMin}–{metrics.totalCovers + metrics.walkInMax}
                </p>
                <p className=\"metric-detail\">With walk-ins included</p>
              </div>
              <span className=\"metric-icon\">🤝</span>
            </div>
          </div>

          <div className=\"metric-card\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex-1\">
                <p className=\"metric-label\" style={{color: '#7851A9'}}>Team on Floor</p>
                <p className=\"metric-value\" style={{color: '#5B3A87'}}>{metrics.staffScheduled}</p>
                <p className=\"metric-detail\">{metrics.totalHours}hrs scheduled</p>
              </div>
              <span className=\"metric-icon\">👥</span>
            </div>
          </div>

          <div className=\"metric-card\">
            <div className=\"flex items-center justify-between\">
              <div className=\"flex-1\">
                <p className=\"metric-label\" style={{color: '#8B6914'}}>Labor Investment</p>
                <p className=\"metric-value\" style={{color: '#654A0E'}}>${metrics.laborCost}</p>
                <p className=\"metric-detail\">Tonight's projection</p>
              </div>
              <span className=\"metric-icon\">💰</span>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Display */}
      {error && (
        <div className=\"card\" style={{background: 'var(--color-danger-light)', borderColor: 'var(--color-danger)'}} data-testid=\"briefing-error\">
          <p style={{color: 'var(--color-danger)', fontWeight: 600}}>⚠️ {error}</p>
        </div>
      )}

      {briefing && (
        <div className=\"card\" style={{borderWidth: '2px', borderColor: 'var(--color-accent)'}} data-testid=\"briefing-display\">
          <div className=\"flex items-center justify-between mb-6 pb-4\" style={{borderBottom: '2px solid var(--color-border)'}}>
            <div>
              <h2 className=\"text-3xl font-bold\" style={{color: 'var(--color-primary-dark)'}}>
                🎯 Tonight's Service Intelligence
              </h2>
              <p className=\"text-sm mt-1\" style={{color: 'var(--color-text-secondary)'}}>
                Generated for service on {formatDate(briefing.service_date)}
              </p>
            </div>
            <span className=\"text-xs px-3 py-1.5 rounded-full\" style={{background: 'var(--color-accent-light)', color: 'var(--color-primary-dark)', fontWeight: 600}}>
              {new Date(briefing.generated_at).toLocaleTimeString()}
            </span>
          </div>
          <div className=\"briefing-content\" style={{
            background: 'linear-gradient(135deg, #FAF9F6 0%, #FFFFFF 100%)',
            padding: '2.5rem',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            lineHeight: '1.8'
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Georgia, serif',
              fontSize: '1.05rem',
              color: 'var(--color-text)',
              margin: 0
            }}>
              {briefing.briefing_text}
            </pre>
          </div>
        </div>
      )}

      {!briefing && !loading && (
        <div className=\"card text-center py-16\" data-testid=\"no-briefing-message\" style={{background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF9F6 100%)'}}>
          <span className=\"empty-icon\">📋</span>
          <h3 className=\"empty-title\">Ready to Begin Service Intelligence</h3>
          <p className=\"empty-description mb-6\">
            Generate your pre-shift briefing to ensure enlightened hospitality for tonight's service
          </p>
          <button
            onClick={handleGenerateBriefing}
            className=\"btn btn-accent\"
          >
            ✨ Generate Service Intelligence
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

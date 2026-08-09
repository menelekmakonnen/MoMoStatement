import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/uiStore';

export default function GodModeDashboard() {
  const { user } = useAuth();
  const addToast = useUIStore(s => s.addToast);

  if (user?.role !== 'god_mode') {
    return <div>Unauthorized. God Mode required.</div>;
  }

  const handleDangerAction = (action) => {
    if(window.confirm(`Are you absolutely sure you want to ${action}? This cannot be undone.`)) {
      addToast({type: 'warning', message: `Executed: ${action}`});
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div>
        <h2 style={{margin: '0 0 0.5rem 0', color: '#F87171'}}>God Mode Console</h2>
        <p style={{color: 'var(--color-text-muted)', margin: 0}}>With great power comes great responsibility.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-widget" style={{borderColor: 'rgba(248,113,113,0.3)'}}>
          <div className="stat-widget-title">System Uptime</div>
          <div className="stat-widget-value">99.99%</div>
        </div>
        <div className="glass-card stat-widget" style={{borderColor: 'rgba(248,113,113,0.3)'}}>
          <div className="stat-widget-title">API Quota</div>
          <div className="stat-widget-value">45%</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--color-border)'}}>
          <h3 style={{margin: 0}}>System Configuration</h3>
        </div>
        <div style={{padding: '1.5rem'}}>
          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label className="form-label">MAINTENANCE_MODE</label>
            <select className="input" defaultValue="false">
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">MAX_UPLOAD_SIZE_MB</label>
            <input type="number" className="input" defaultValue="50" />
          </div>
          <button className="btn btn-primary" style={{marginTop: '1rem'}} onClick={() => addToast({type: 'success', message: 'Config updated'})}>Save Config</button>
        </div>
      </div>

      <div className="glass-card god-mode-danger">
        <div style={{padding: '1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)'}}>
          <h3 style={{margin: 0, color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Danger Zone
          </h3>
        </div>
        <div style={{padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <button className="btn" style={{background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid #F87171'}} onClick={() => handleDangerAction('Reset Database')}>
            Reset Database
          </button>
          <button className="btn" style={{background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid #F87171'}} onClick={() => handleDangerAction('Flush Cache')}>
            Flush Redis Cache
          </button>
          <button className="btn" style={{background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid #F87171'}} onClick={() => handleDangerAction('Impersonate User')}>
            Impersonate User
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function SuperAdminDashboard() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div>
        <h2 style={{margin: '0 0 0.5rem 0'}}>Super Admin Overview</h2>
        <p style={{color: 'var(--color-text-muted)', margin: 0}}>Organization-wide metrics and activity logs.</p>
      </div>

      <div className="glass-card">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--color-border)'}}>
          <h3 style={{margin: 0}}>Activity Log</h3>
        </div>
        <div className="admin-table-wrapper" style={{border: 'none', borderRadius: 0}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin User</th>
                <th>Action</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '10:45 AM', user: 'admin1@sys.com', action: 'Disabled user', target: 'user4@example.com' },
                { time: '09:12 AM', user: 'admin2@sys.com', action: 'Exported report', target: 'Monthly_Stats.csv' },
                { time: 'Yesterday', user: 'admin1@sys.com', action: 'Changed role', target: 'user12@example.com -> Admin' },
              ].map((log, i) => (
                <tr key={i}>
                  <td style={{color: 'var(--color-text-muted)'}}>{log.time}</td>
                  <td style={{fontWeight: 500}}>{log.user}</td>
                  <td>{log.action}</td>
                  <td style={{color: 'var(--color-text-muted)'}}>{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--color-border)'}}>
          <h3 style={{margin: 0}}>Data Export</h3>
        </div>
        <div style={{padding: '1.5rem', display: 'flex', gap: '1rem'}}>
          <button className="btn btn-secondary">Export Users (CSV)</button>
          <button className="btn btn-secondary">Export Audit Logs (JSON)</button>
        </div>
      </div>
    </div>
  );
}

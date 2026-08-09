import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{marginBottom: '2rem'}}>
        <h2 style={{margin: '0 0 0.5rem 0'}}>Overview</h2>
        <p style={{color: 'var(--color-text-muted)', margin: 0}}>Welcome back, {user?.name}. Here's what's happening.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card stat-widget">
          <div className="stat-widget-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Total Users
          </div>
          <div className="stat-widget-value">1,284</div>
          <div style={{fontSize: '0.8rem', color: 'var(--color-success)'}}>+12% from last month</div>
        </div>
        
        <div className="glass-card stat-widget">
          <div className="stat-widget-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            Active Sessions
          </div>
          <div className="stat-widget-value">342</div>
          <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>Currently online</div>
        </div>

        <div className="glass-card stat-widget">
          <div className="stat-widget-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Statements Processed
          </div>
          <div className="stat-widget-value">8,921</div>
          <div style={{fontSize: '0.8rem', color: 'var(--color-success)'}}>System operating normally</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 style={{margin: 0}}>Recent Registrations</h3>
          <button className="btn btn-secondary btn-sm">View All</button>
        </div>
        <div className="admin-table-wrapper" style={{border: 'none', borderRadius: 0}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td>
                    <div style={{fontWeight: 500}}>User {i}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>user{i}@example.com</div>
                  </td>
                  <td><span className="role-badge user">User</span></td>
                  <td><span className="status-dot active"></span> Active</td>
                  <td>Today, 10:{i}4 AM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

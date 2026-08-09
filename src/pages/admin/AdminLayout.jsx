import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth, useRequireRole } from '../../hooks/useAuth';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { user, hasRole, logout } = useAuth();
  useRequireRole('admin');

  if (!user) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="auth-logo" style={{width: '32px', height: '32px', fontSize: '1rem'}}>M</div>
          <div>
            <h2 style={{fontSize: '1rem', margin: 0}}>Admin Panel</h2>
            <div className={`role-badge ${user.role}`} style={{marginTop: '4px'}}>
              {user.role.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/dashboard" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            Dashboard
          </NavLink>
          
          {hasRole('admin') && (
            <NavLink to="/admin/users" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              User Management
            </NavLink>
          )}

          {hasRole('super_admin') && (
            <NavLink to="/admin/super" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              Super Admin
            </NavLink>
          )}

          {hasRole('god_mode') && (
            <NavLink to="/admin/godmode" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l2-9 5 18 3-9h6"></path></svg>
              God Mode
            </NavLink>
          )}
        </nav>
        
        <div style={{padding: '1rem', borderTop: '1px solid var(--color-border)'}}>
          <Link to="/app" className="btn btn-secondary" style={{width: '100%', marginBottom: '0.5rem', justifyContent: 'center'}}>
            Back to App
          </Link>
          <button onClick={logout} className="btn" style={{width: '100%', justifyContent: 'center'}}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 style={{fontSize: '1.25rem', fontWeight: 600, margin: 0}}>Admin Control</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Logged in as {user.email}</span>
          </div>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

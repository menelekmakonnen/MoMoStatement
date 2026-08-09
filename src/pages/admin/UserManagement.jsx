import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/uiStore';

// Mock data
const mockUsers = Array.from({length: 15}).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i+1}@example.com`,
  role: i === 0 ? 'god_mode' : i < 3 ? 'super_admin' : i < 6 ? 'admin' : 'user',
  status: i % 5 === 0 ? 'disabled' : 'active',
  joined: '2025-01-01'
}));

export default function UserManagement() {
  const { user } = useAuth();
  const addToast = useUIStore(s => s.addToast);
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');

  // Filter out god_mode unless viewer is god_mode
  const visibleUsers = users.filter(u => {
    if (u.role === 'god_mode' && user.role !== 'god_mode') return false;
    return u.email.includes(search) || u.name.includes(search);
  });

  const canEdit = (targetRole) => {
    const hierarchy = { 'user': 1, 'admin': 2, 'super_admin': 3, 'god_mode': 4 };
    return hierarchy[user.role] > hierarchy[targetRole];
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        if (!canEdit(u.role)) {
          addToast({type: 'error', message: "Cannot edit this user's status"});
          return u;
        }
        addToast({type: 'success', message: `User ${u.status === 'active' ? 'disabled' : 'enabled'}`});
        return { ...u, status: u.status === 'active' ? 'disabled' : 'active' };
      }
      return u;
    }));
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 style={{margin: 0}}>User Management</h2>
        <div className="input-with-icon" style={{width: '300px'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            className="input" 
            placeholder="Search users..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{fontWeight: 500}}>{u.name}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--color-text-muted)'}}>{u.email}</div>
                </td>
                <td><span className={`role-badge ${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                <td>
                  <span className={`status-dot ${u.status}`}></span> 
                  <span style={{textTransform: 'capitalize'}}>{u.status}</span>
                </td>
                <td>{u.joined}</td>
                <td>
                  <div className="admin-actions">
                    <button className="icon-btn" title="View details">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    {canEdit(u.role) && (
                      <>
                        <button className="icon-btn" title="Edit role">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="icon-btn" title={u.status === 'active' ? 'Disable' : 'Enable'} onClick={() => handleToggleStatus(u.id)}>
                          {u.status === 'active' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

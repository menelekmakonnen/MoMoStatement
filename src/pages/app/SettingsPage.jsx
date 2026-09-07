import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CONFIG from '../../config';
import { Icon } from '../../components/ui/Icon';
import { useAuthStore } from '../../stores/authStore';
import { useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

const PROVIDERS = [
  ['MTN', 'MTN Mobile Money'],
  ['TELECEL', 'Telecel Cash'],
  ['AIRTELTIGO', 'AirtelTigo Money'],
];

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const transactions = useTxnStore((state) => state.transactions);
  const clearTransactions = useTxnStore((state) => state.clearTransactions);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const addToast = useUIStore((state) => state.addToast);
  const [providers, setProviders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('momo_provider_preferences') || '{"MTN":true,"TELECEL":true,"AIRTELTIGO":true}');
    } catch {
      return { MTN: true, TELECEL: true, AIRTELTIGO: true };
    }
  });

  useEffect(() => {
    try { localStorage.setItem('momo_provider_preferences', JSON.stringify(providers)); } catch { /* safe storage */ }
  }, [providers]);

  const toggleProvider = (provider) => setProviders((current) => ({ ...current, [provider]: !current[provider] }));

  const handleClear = () => {
    if (!transactions.length) {
      addToast({ level: 'info', message: 'There are no imported records to clear.' });
      return;
    }
    if (window.confirm('Clear every imported transaction from this browser? This cannot be undone.')) {
      clearTransactions();
      addToast({ level: 'success', message: 'Imported records cleared from this browser.' });
    }
  };

  return (
    <div className="settings-page">
      <div className="page-intro">
        <div>
          <h2>Workspace settings</h2>
          <p>These preferences are local to this browser. Connected sync is not enabled in this build.</p>
        </div>
        <span className="badge badge-neutral">v{CONFIG.APP_VERSION}</span>
      </div>

      <div className="settings-stack">
        <section className="surface-card settings-card">
          <h3>Account</h3>
          <div className="settings-row"><div><strong>{user?.name || 'Personal workspace'}</strong><p>{user?.email || 'No connected account'}</p></div><Icon name="user" size={20} className="muted" /></div>
          <div className="settings-row"><div><strong>Data mode</strong><p>Local-first. {transactions.length} imported record{transactions.length === 1 ? '' : 's'} currently stored in this browser.</p></div><span className="badge badge-success"><Icon name="lock" size={13} /> Private</span></div>
        </section>

        <section className="surface-card settings-card">
          <h3>Appearance</h3>
          <div className="settings-row">
            <div><strong>Theme</strong><p>Choose a light or dark workspace for long statement reviews.</p></div>
            <button className={`toggle ${theme === 'dark' ? 'active' : ''}`} type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <span className="sr-only">{theme === 'dark' ? 'Dark theme on' : 'Dark theme off'}</span>
            </button>
          </div>
        </section>

        <section className="surface-card settings-card">
          <h3>Provider preferences</h3>
          {PROVIDERS.map(([id, label]) => (
            <div className="settings-row" key={id}>
              <div><strong>{label}</strong><p>{providers[id] ? 'Included in provider coverage and filters.' : 'Hidden from your preferred provider view.'}</p></div>
              <button className={`toggle ${providers[id] ? 'active' : ''}`} type="button" aria-label={`${providers[id] ? 'Disable' : 'Enable'} ${label}`} aria-pressed={providers[id]} onClick={() => toggleProvider(id)}><span className="sr-only">Toggle {label}</span></button>
            </div>
          ))}
        </section>

        <section className="surface-card settings-card">
          <h3>Data management</h3>
          <div className="settings-row"><div><strong>Export a complete backup</strong><p>Keep a copy of all imported records before clearing this browser.</p></div><Link className="btn btn-secondary" to="/app/export"><Icon name="download" size={16} /> Open export</Link></div>
          <div className="settings-row"><div><strong>Clear imported records</strong><p>Removes local transaction data and leaves preferences intact.</p></div><button className="btn btn-danger" type="button" onClick={handleClear}><Icon name="trash" size={16} /> Clear data</button></div>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { Icon } from '../../components/ui/Icon';
import { useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';
import '../../styles/pages.css';

export default function AppLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const storageError = useTxnStore((state) => state.storageError);
  const retryPersistence = useTxnStore((state) => state.retryPersistence);
  const addToast = useUIStore((state) => state.addToast);

  const handleRetry = () => {
    const result = retryPersistence();
    const recoveredCount = result.reconciledCount || 0;
    const message = result.persisted
      ? (result.reloaded ? `${recoveredCount} session row${recoveredCount === 1 ? '' : 's'} reconciled; your local records are saved again.` : 'Your local records are saved again.')
      : 'This browser still cannot save local records.';
    addToast({ level: result.persisted ? 'success' : 'warning', message });
  };

  const handleSkip = (event) => {
    event.preventDefault();
    const target = document.getElementById('main-content');
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'start' });
  };

  return (
    <div
      className="app-layout"
      style={{ gridTemplateColumns: `${sidebarCollapsed ? 'var(--sidebar-collapsed)' : `${sidebarWidth}px`} minmax(0, 1fr)` }}
    >
      <a className="skip-link" href="#main-content" onClick={handleSkip}>Skip to content</a>
      <Sidebar />
      <main className="main-content" id="main-content" tabIndex="-1">
        <Header />
        {storageError && (
          <div className="storage-warning" role="alert">
            <div className="storage-warning-copy">
              <Icon name="alert" size={18} />
              <span><strong>Not saved in this browser.</strong> Your current rows remain available for this session; export a backup before closing or retry local storage.</span>
            </div>
            <div className="storage-warning-actions">
              <button className="btn btn-secondary btn-sm" type="button" onClick={handleRetry}>Retry save</button>
              <Link className="btn btn-ghost btn-sm" to="/app/export">Export now</Link>
            </div>
          </div>
        )}
        <div className="page-container">
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

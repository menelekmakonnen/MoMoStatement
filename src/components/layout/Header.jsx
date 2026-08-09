import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useAuthStore } from '../../stores/authStore';
import { useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

const PAGE_META = {
  '/app/import': { title: 'Import', eyebrow: 'Build your statement', description: 'Bring your MoMo messages into one private workspace.' },
  '/app/statement': { title: 'Statement', eyebrow: 'Your money trail', description: 'Search, filter, and inspect every parsed transaction.' },
  '/app/dashboard': { title: 'Dashboard', eyebrow: 'At a glance', description: 'See cash flow, balances, and provider coverage.' },
  '/app/insights': { title: 'Insights', eyebrow: 'Patterns worth noticing', description: 'Turn transaction history into clear next actions.' },
  '/app/export': { title: 'Export', eyebrow: 'Take it with you', description: 'Create a clean copy for your records or a reviewer.' },
  '/app/settings': { title: 'Settings', eyebrow: 'Workspace preferences', description: 'Keep the workspace useful, private, and yours.' },
};

function getPageMeta(pathname) {
  return PAGE_META[pathname] || PAGE_META['/app/import'];
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = getPageMeta(location.pathname);
  const search = useTxnStore((state) => state.filters.search);
  const setFilter = useTxnStore((state) => state.setFilter);
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.title = `${meta.title} — MoMo Statement`;
  }, [meta.title]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current.blur();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const initials = (user?.name || 'My workspace')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="header">
      <div className="header-heading">
        <span className="header-eyebrow">{meta.eyebrow}</span>
        <h1 className="header-title">{meta.title}</h1>
        <p className="header-description">{meta.description}</p>
      </div>

      <div className="header-actions">
        <label className="header-search">
          <Icon name="search" size={17} />
          <span className="sr-only">Search transactions</span>
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search transactions"
            value={search}
            onChange={(event) => setFilter('search', event.target.value)}
          />
          <kbd>Ctrl K</kbd>
        </label>

        <button
          className="icon-btn"
          type="button"
          aria-label="View workspace notices"
          title="Workspace notices"
          onClick={() => addToast({ level: 'info', message: 'Your workspace is running locally. No data has been synced.' })}
        >
          <Icon name="bell" size={19} />
        </button>

        <button
          className="avatar avatar-button"
          type="button"
          aria-label="Open settings"
          title="Open settings"
          onClick={() => navigate('/app/settings')}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}

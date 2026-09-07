import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, LogoMark } from '../ui/Icon';
import { useUIStore } from '../../stores/uiStore';

const NAV_ITEMS = [
  { path: '/app/import', label: 'Import', hint: 'Add messages', icon: 'upload' },
  { path: '/app/statement', label: 'Statement', hint: 'Browse history', icon: 'document' },
  { path: '/app/dashboard', label: 'Dashboard', hint: 'See the overview', icon: 'dashboard' },
  { path: '/app/insights', label: 'Insights', hint: 'Find patterns', icon: 'insights' },
  { path: '/app/export', label: 'Export', hint: 'Create a copy', icon: 'download' },
  { path: '/app/settings', label: 'Settings', hint: 'Tune workspace', icon: 'settings' },
];

const MOBILE_PRIMARY_ITEMS = NAV_ITEMS.slice(0, 3).map((item) => (
  item.label === 'Dashboard' ? { ...item, label: 'Overview', hint: 'See the overview' } : item
));
const MOBILE_MORE_ITEMS = NAV_ITEMS.slice(3);

const MIN_WIDTH = 224;
const MAX_WIDTH = 360;

export default function Sidebar() {
  const location = useLocation();
  const [isResizing, setIsResizing] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const mobileMoreRef = useRef(null);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth);

  useEffect(() => {
    if (!isResizing) return undefined;

    const handlePointerMove = (event) => {
      const nextWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, event.clientX));
      setSidebarWidth(nextWidth);
    };
    const handlePointerUp = () => setIsResizing(false);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    document.body.classList.add('is-resizing-sidebar');
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.body.classList.remove('is-resizing-sidebar');
    };
  }, [isResizing, setSidebarWidth]);

  useEffect(() => {
    if (!mobileMoreOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMoreOpen(false);
    };
    const closeOnOutsidePointer = (event) => {
      if (!mobileMoreRef.current?.contains(event.target)) setMobileMoreOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
    };
  }, [mobileMoreOpen]);

  const handleLogoClick = (event) => {
    if (location.pathname === '/app/dashboard') {
      event.preventDefault();
      window.location.reload();
    }
  };

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
      aria-label="Primary navigation"
    >
      <div className="sidebar-header">
        <NavLink className="sidebar-brand" to="/app/dashboard" onClick={handleLogoClick}>
          <LogoMark size={34} />
          <span className="sidebar-brand-copy">
            <strong>MoMo Statement</strong>
            <small>ICUNI Connect</small>
          </span>
        </NavLink>
      </div>

      <nav className="sidebar-nav sidebar-nav-desktop" aria-label="Workspace">
        <span className="sidebar-section-label">Workspace</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? `${item.label}: ${item.hint}` : undefined}
          >
            <span className="sidebar-nav-icon"><Icon name={item.icon} size={20} /></span>
            <span className="sidebar-nav-copy">
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
            <Icon name="chevronRight" size={15} className="sidebar-nav-arrow" />
          </NavLink>
        ))}
      </nav>

      <nav className="sidebar-nav sidebar-nav-mobile" aria-label="Mobile workspace navigation">
        {MOBILE_PRIMARY_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="mobile-more-wrap" ref={mobileMoreRef}>
          <button
            className={`mobile-nav-item mobile-more-trigger ${mobileMoreOpen || MOBILE_MORE_ITEMS.some((item) => location.pathname === item.path) ? 'active' : ''}`}
            type="button"
            aria-expanded={mobileMoreOpen}
            aria-controls="mobile-more-menu"
            aria-current={MOBILE_MORE_ITEMS.some((item) => location.pathname === item.path) ? 'page' : undefined}
            onClick={() => setMobileMoreOpen((open) => !open)}
          >
            <Icon name="more" size={20} />
            <span>More</span>
          </button>
          {mobileMoreOpen && (
            <div className="mobile-more-menu" id="mobile-more-menu" aria-label="Secondary workspace navigation">
              {MOBILE_MORE_ITEMS.map((item) => (
                <NavLink key={item.path} to={item.path} end className={({ isActive }) => `mobile-more-item ${isActive ? 'active' : ''}`} aria-current={location.pathname === item.path ? 'page' : undefined} onClick={() => setMobileMoreOpen(false)}>
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-profile"
          type="button"
          onClick={() => window.location.hash = '#/app/settings'}
          title="Open workspace settings"
        >
          <span className="profile-mark">M</span>
          <span className="sidebar-profile-copy">
            <strong>Personal workspace</strong>
            <small>Local-first mode</small>
          </span>
          <Icon name="settings" size={16} />
        </button>
        <button
          className="collapse-btn"
          type="button"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Icon name="collapse" size={18} />
          <span>Collapse</span>
        </button>
      </div>

      <button
        className="sidebar-resize-handle"
        type="button"
        aria-label="Resize sidebar"
        title="Drag to resize sidebar"
        onPointerDown={(event) => {
          event.preventDefault();
          setIsResizing(true);
        }}
      >
        <Icon name="drawerHandle" size={16} />
      </button>
    </aside>
  );
}

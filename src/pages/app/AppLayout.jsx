import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useUIStore } from '../../stores/uiStore';
import '../../styles/pages.css';

export default function AppLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useUIStore((state) => state.sidebarWidth);

  return (
    <div
      className="app-layout"
      style={{ gridTemplateColumns: `${sidebarCollapsed ? 'var(--sidebar-collapsed)' : `${sidebarWidth}px`} minmax(0, 1fr)` }}
    >
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar />
      <main className="main-content" id="main-content">
        <Header />
        <div className="page-container">
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

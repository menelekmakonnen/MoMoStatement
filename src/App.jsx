import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Toast from './components/ui/Toast';
import { useUIStore } from './stores/uiStore';

/* ─── Lazy-loaded pages ─── */
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AppLayout = lazy(() => import('./pages/app/AppLayout'));
const ImportPage = lazy(() => import('./pages/app/ImportPage'));
const StatementPage = lazy(() => import('./pages/app/StatementPage'));
const DashboardPage = lazy(() => import('./pages/app/DashboardPage'));
const InsightsPage = lazy(() => import('./pages/app/InsightsPage'));
const ExportPage = lazy(() => import('./pages/app/ExportPage'));
const SettingsPage = lazy(() => import('./pages/app/SettingsPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));
const GodModeDashboard = lazy(() => import('./pages/admin/GodModeDashboard'));

/**
 * Loading fallback — ghost-box skeleton per §10.4 (never spinners)
 */
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      <div className="skeleton skeleton-title" style={{ width: '40%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
      <div className="skeleton skeleton-chart" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
    </div>
  );
}

/**
 * App — Root component
 * [LAW] ErrorBoundary at top level (§10.2)
 * [LAW] Hash routing, every page its own URL (§3.2)
 * [LAW] Lazy-loaded route groups for code splitting
 */
export default function App() {
  const setTheme = useUIStore((s) => s.setTheme);

  useEffect(() => {
    const saved = localStorage.getItem('momo_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, [setTheme]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ─── Public ─── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ─── App (protected) ─── */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="import" replace />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="statement" element={<StatementPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ─── Admin (role-gated) ─── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="super" element={<SuperAdminDashboard />} />
            <Route path="god" element={<GodModeDashboard />} />
          </Route>

          {/* ─── Catch-all ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toast />
    </ErrorBoundary>
  );
}

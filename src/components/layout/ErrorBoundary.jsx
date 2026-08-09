import { Component } from 'react';
import CONFIG from '../../config';

/**
 * ErrorBoundary — Branded crash screen
 * [LAW] Every React app has a top-level ErrorBoundary that shows a branded crash
 * screen (never a white page) with a Report Bug button. Auto-reset on navigation. (§10.2)
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // [LAW] Structured logging (§10.5)
    console.error(
      `[${CONFIG.APP_NAME}] [ERROR] [ErrorBoundary] Uncaught error:`,
      error,
      errorInfo,
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report: ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`);
    const body = encodeURIComponent(
      `Error: ${this.state.error?.message || 'Unknown'}\n\n` +
      `Stack: ${this.state.error?.stack?.slice(0, 500) || 'N/A'}\n\n` +
      `Browser: ${navigator.userAgent}\n` +
      `Page: ${window.location.href}\n` +
      `Time: ${new Date().toISOString()}`,
    );
    window.open(`mailto:${CONFIG.EMAILS.TECH_ISSUE}?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            {/* Shield SVG icon */}
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D4A847" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={styles.icon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.description}>
              {CONFIG.APP_NAME} encountered an unexpected error. Your data is safe — 
              nothing has been lost.
            </p>
            {this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.message}
              </pre>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.primaryBtn}>
                Try Again
              </button>
              <button onClick={this.handleReportBug} style={styles.secondaryBtn}>
                Report Bug
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#141414',
    padding: '24px',
  },
  card: {
    background: 'rgba(30, 30, 30, 0.8)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '48px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  icon: {
    margin: '0 auto 24px',
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '12px',
    fontFamily: "'Inter Variable', 'Inter', sans-serif",
  },
  description: {
    color: '#c0c0c0',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '20px',
    fontFamily: "'Inter Variable', 'Inter', sans-serif",
  },
  errorDetail: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: 'left',
    marginBottom: '24px',
    overflow: 'auto',
    maxHeight: '100px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #D4A847, #ad7a28)',
    color: '#141414',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Inter Variable', 'Inter', sans-serif",
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#e0e0e0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Inter Variable', 'Inter', sans-serif",
  },
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, LogoMark } from '../../components/ui/Icon';
import TrustBar from './TrustBar';

const Hero = () => {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="landing-hero">
      <div className="landing-shell">
        <nav className="landing-nav" aria-label="Public navigation">
          <Link className="landing-brand" to="/">
            <LogoMark size={36} />
            <span className="landing-brand-copy">
              <strong>MoMo Statement</strong>
              <small>ICUNI Connect</small>
            </span>
          </Link>
          <div className="landing-nav-actions">
            <Link className="btn btn-ghost btn-sm" to="/app/import">
              <Icon name="wallet" size={16} />
              <span>Open workspace</span>
            </Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="lock" size={14} /> Local-first money workspace</span>
            <h1>Turn your MoMo messages into a statement <span>you can trust.</span></h1>
            <p>Paste your messages or import an archive. MoMo Statement keeps the original source attached while it turns noisy alerts into an exact, reviewable money trail.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/app/import">
                Start with a sample
                <Icon name="arrowRight" size={17} />
              </Link>
              <button className="btn btn-secondary btn-lg" type="button" onClick={scrollToHowItWorks}>
                See how it works
              </button>
            </div>
            <p className="hero-caption"><Icon name="shield" size={15} /> No account required for the local workflow.</p>
          </div>

          <div className="hero-proof" aria-label="Statement preview">
            <div className="proof-window">
              <div className="proof-window-bar">
                <span className="proof-window-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>Illustrative sample · local</span>
              </div>
              <div className="proof-balance">
                <span className="proof-balance-label">Latest reported balance</span>
                <strong className="proof-balance-value">GHS 1,850.50</strong>
                <span className="proof-balance-meta"><Icon name="checkCircle" size={14} /> Matched to imported source</span>
              </div>
              <div className="proof-stats">
                <div className="proof-stat"><span>Received</span><strong className="positive">+ GHS 420.00</strong></div>
                <div className="proof-stat"><span>Sent</span><strong className="negative">− GHS 275.00</strong></div>
              </div>
              <div className="proof-rows">
                <div className="proof-row"><span><Icon name="arrowDown" size={16} /><span><strong>Payment received</strong><small>Kweku Mensah</small></span></span><strong>+420.00</strong></div>
                <div className="proof-row"><span><Icon name="arrowUp" size={16} /><span><strong>Merchant payment</strong><small>Max Mart</small></span></span><strong>−75.00</strong></div>
                <div className="proof-row"><span><Icon name="arrowUp" size={16} /><span><strong>Cash out</strong><small>Kweku Stores</small></span></span><strong>−200.00</strong></div>
              </div>
            </div>
          </div>
        </div>

        <TrustBar />
      </div>
    </section>
  );
};

export default Hero;

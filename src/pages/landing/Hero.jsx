import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, LogoMark } from '../../components/ui/Icon';
import TrustBar from './TrustBar';

const Hero = () => {
  const scrollTo = (id) => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
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
            <button className="landing-nav-link" type="button" onClick={() => scrollTo('how-it-works')}>
              How it works
            </button>
            <Link className="btn btn-secondary btn-sm" to="/app/import" aria-label="Open workspace">
              <span>Open workspace</span>
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="lock" size={14} /> Local-first money workspace</span>
            <h1>Your MoMo messages. <span>A clear statement.</span></h1>
            <p>Bring your messages together. Check every transaction. Download the record you need.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/app/import">
                Create my statement
                <Icon name="arrowRight" size={17} />
              </Link>
              <button className="btn btn-ghost btn-lg" type="button" onClick={() => scrollTo('demo')}>
                Try a sample
              </button>
            </div>
            <p className="hero-caption"><Icon name="shield" size={15} /> No account required · your records stay in this browser until you export.</p>
          </div>

          <figure className="hero-media">
            <div className="hero-image-frame">
              <picture>
                <source srcSet="/images/momo-cover.webp" type="image/webp" />
                <img
                  src="/images/momo-cover-source.png"
                  alt="A Ghanaian shopkeeper checking a phone beside a handwritten sales ledger"
                  width="1619"
                  height="972"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              <span className="hero-image-label">Messages in. Money made legible.</span>
            </div>
            <figcaption className="hero-proof-strip">
              <div className="proof-source">
                <span className="proof-kicker">One message → one row</span>
                <strong>Payment received for GHS 420.00</strong>
                <span>from KWEKU MENSAH · Reference: Sales</span>
              </div>
              <div className="proof-result">
                <span className="proof-kicker">Parsed locally</span>
                <strong>+ GHS 420.00</strong>
                <span>Received · MTN · source attached</span>
              </div>
              <details className="proof-source-details">
                <summary><Icon name="eye" size={15} /> View source</summary>
                <pre>{`Payment received for GHS 420.00 from KWEKU MENSAH (0241234567).\nCurrent Balance: GHS 1,850.50. Reference: Sales.`}</pre>
              </details>
            </figcaption>
          </figure>
        </div>

        <TrustBar />
      </div>
    </section>
  );
};

export default Hero;

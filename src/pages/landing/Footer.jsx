import React from 'react';
import { Link } from 'react-router-dom';

const scrollTo = (id) => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
};

const Footer = () => (
  <footer className="footer">
    <div className="landing-shell">
      <div className="footer-grid">
        <div>
          <h4>MoMo Statement</h4>
          <p>A clear, local-first workspace for Ghanaian Mobile Money messages, with the source kept close to the number.</p>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li><button type="button" onClick={() => scrollTo('features')}>Features</button></li>
            <li><button type="button" onClick={() => scrollTo('how-it-works')}>How it works</button></li>
            <li><button type="button" onClick={() => scrollTo('demo')}>Interactive demo</button></li>
            <li><Link to="/app/import">Open workspace</Link></li>
          </ul>
        </div>
        <div>
          <h4>Trust</h4>
          <ul>
            <li><button type="button" onClick={() => scrollTo('pricing')}>Beta terms</button></li>
            <li><a href="https://icuni.org" target="_blank" rel="noreferrer">About ICUNI</a></li>
            <li><a href="mailto:support@icuni.org">Support</a></li>
            <li><a href="mailto:feedback@icuni.org">Send feedback</a></li>
          </ul>
        </div>
        <div>
          <h4>Built in Accra</h4>
          <ul>
            <li>MTN, Telecel, AirtelTigo</li>
            <li>GHS exact amounts</li>
            <li>Local-first mode</li>
            <li>Version 2.0.0 beta</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ICUNI Connect. All rights reserved.</span>
        <span className="footer-bottom-right"><span>Made with care in Accra, Ghana</span><span className="ghana-flag" aria-label="Ghana"><i className="gh-red" /><i className="gh-gold" /><i className="gh-green" /></span></span>
      </div>
    </div>
  </footer>
);

export default Footer;

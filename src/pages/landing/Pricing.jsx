import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';

const FEATURES = [
  'Local import, review, and export are available during beta',
  'MTN, Telecel, and AirtelTigo patterns are reported explicitly',
  'PDF, CSV, and JSON exports are available from the workspace',
  'No account wall for the local workflow',
];

const Pricing = () => (
  <section id="pricing" className="landing-section landing-section-muted">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">Clear terms</span>
        <h2>Start with a clear boundary.</h2>
        <p>The local workflow is available during beta. Keep your data in this browser, export what you need, and decide later whether connected features are worth adding.</p>
      </div>

      <div className="pricing-card">
        <div className="pricing-card-header">
          <div><h3>Beta access</h3><p>The complete local statement workflow.</p></div>
          <span className="badge badge-success"><Icon name="checkCircle" size={14} /> Available now</span>
        </div>
        <p className="price-text">Local</p>
        <p className="price-subtitle">during the beta period</p>
        <ul className="pricing-features">
          {FEATURES.map((feature) => <li key={feature}><Icon name="check" size={16} />{feature}</li>)}
        </ul>
        <Link className="btn btn-primary btn-lg btn-full" to="/app/import">Start your first statement <Icon name="arrowRight" size={17} /></Link>
        <p className="pricing-note">Connected features are not enabled in this build. Messages Web is an optional local desktop helper; it never receives your Google credentials.</p>
      </div>
    </div>
  </section>
);

export default Pricing;

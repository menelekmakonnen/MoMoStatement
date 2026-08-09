import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';

const FEATURES = [
  'Unlimited local imports during beta',
  'MTN, Telecel, and AirtelTigo support',
  'Cash-flow and review signals',
  'PDF, CSV, and JSON exports',
  'No account required for local mode',
  'Original source kept with each row',
];

const Pricing = () => (
  <section id="pricing" className="landing-section landing-section-muted">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">Clear terms</span>
        <h2>Useful before it is expensive.</h2>
        <p>The local workflow is free during beta. Keep your data on this device, export what you need, and decide later whether connected features are worth adding.</p>
      </div>

      <div className="pricing-card">
        <div className="pricing-card-header">
          <div><h3>Beta access</h3><p>The complete local statement workflow.</p></div>
          <span className="badge badge-success"><Icon name="checkCircle" size={14} /> Available now</span>
        </div>
        <p className="price-text">Free</p>
        <p className="price-subtitle">during the beta period</p>
        <ul className="pricing-features">
          {FEATURES.map((feature) => <li key={feature}><Icon name="check" size={16} />{feature}</li>)}
        </ul>
        <Link className="btn btn-primary btn-lg btn-full" to="/app/import">Start your first statement <Icon name="arrowRight" size={17} /></Link>
        <p className="pricing-note">Premium and connected features are not enabled in this build. Nothing here asks for financial credentials.</p>
      </div>
    </div>
  </section>
);

export default Pricing;

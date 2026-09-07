import React from 'react';
import { Icon } from '../../components/ui/Icon';

const FEATURES = [
  { title: 'The source stays attached', desc: 'Open the original message behind a parsed row. Provider, reference, fee, tax, and balance remain inspectable.', icon: 'document', label: 'Traceable by design' },
  { title: 'The number stays honest', desc: 'Reported balances are labelled as reported. Unknown dates stay unknown, and heuristics point back to supporting rows.', icon: 'checkCircle', label: 'Evidence before polish' },
  { title: 'The handoff is yours', desc: 'Search, filter, and export a clean PDF, CSV, or JSON copy from the same local workspace.', icon: 'download', label: 'Ready when you are' },
];

const Features = () => (
  <section id="features" className="landing-section">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">What earns trust</span>
        <h2>Clear at a glance. Inspectable when it matters.</h2>
        <p>The product earns its place by making the path from raw message to usable record easy to follow.</p>
      </div>
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon-container"><Icon name={feature.icon} size={22} /></div>
            <span className="feature-label">{feature.label}</span>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Features;

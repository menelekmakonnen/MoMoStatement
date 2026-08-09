import React from 'react';
import { Icon } from '../../components/ui/Icon';

const FEATURES = [
  { title: 'Provider-aware parsing', desc: 'MTN, Telecel, and AirtelTigo formats stay distinct so the source remains understandable.', icon: 'layers' },
  { title: 'Cash-flow clarity', desc: 'See received, sent, fees, and the latest reported balance without hiding the exact rows behind a chart.', icon: 'activity' },
  { title: 'Evidence-led insights', desc: 'Review signals point you back to the underlying transaction instead of pretending a heuristic is financial advice.', icon: 'insights' },
  { title: 'Local by default', desc: 'Imported records stay in this browser until you deliberately choose an export or connected action.', icon: 'lock' },
  { title: 'Searchable statement', desc: 'Find a counterparty, reference, phone number, provider, type, or date range in a few taps.', icon: 'search' },
  { title: 'Clean handoff', desc: 'Create a readable PDF, exact CSV, or faithful JSON backup for your next decision or reviewer.', icon: 'download' },
];

const Features = () => (
  <section id="features" className="landing-section">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">A small system with useful depth</span>
        <h2>Everything you need to make the record useful.</h2>
        <p>The surface stays calm. The detail is there when you need to verify a number, understand a pattern, or hand the statement to someone else.</p>
      </div>
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon-container"><Icon name={feature.icon} size={22} /></div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Features;

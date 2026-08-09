import React from 'react';
import { Icon } from '../../components/ui/Icon';

const STEPS = [
  {
    title: 'Get your messages',
    desc: 'Request a statement from your provider or copy the transaction alerts already on your phone.',
    icon: 'download',
  },
  {
    title: 'Paste or upload',
    desc: 'Use the guided import tabs. Plain text and SMS Backup & Restore XML are parsed in this browser.',
    icon: 'upload',
  },
  {
    title: 'Review and export',
    desc: 'Check balances, fees, categories, and original source text before you create a clean statement.',
    icon: 'checkCircle',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="landing-section landing-section-muted">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">A calmer first run</span>
        <h2>From noisy alerts to a useful record.</h2>
        <p>Each step has one job, a visible result, and a safe way back. You can start with sample data before importing anything personal.</p>
      </div>
      <div className="how-it-works-grid">
        {STEPS.map((step, index) => (
          <article className="step-card" data-step={`0${index + 1}`} key={step.title}>
            <div className="step-number">{index + 1}</div>
            <div className="step-icon"><Icon name={step.icon} size={22} /></div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

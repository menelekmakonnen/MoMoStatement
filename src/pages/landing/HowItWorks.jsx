import React from 'react';
import { Icon } from '../../components/ui/Icon';

const STEPS = [
  {
    title: 'Choose your source',
    desc: 'Paste a conversation, upload a TXT/XML archive, or use the optional desktop Messages Web helper.',
    icon: 'upload',
  },
  {
    title: 'See what was found',
    desc: 'The preview separates new rows, duplicates, unsupported messages, and anything that needs review.',
    icon: 'eye',
  },
  {
    title: 'Keep the record',
    desc: 'Review amounts, fees, balances, and source text, then export the statement you actually need.',
    icon: 'checkCircle',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="landing-section landing-section-muted">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">Three clear steps</span>
        <h2>From messages to a statement you can inspect.</h2>
        <p>Start with a sample or bring your own messages. Every step makes the next decision obvious.</p>
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

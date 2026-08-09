import React from 'react';
import { Icon } from '../../components/ui/Icon';

const REVIEW_CUES = [
  { title: 'Source first', body: 'Every parsed row can unfold into its original message, reference, fee, tax, and provider fields.', label: 'Traceability', icon: 'document' },
  { title: 'Local by default', body: 'The core import, filter, and export path works without sending transaction data to a server.', label: 'Privacy boundary', icon: 'lock' },
  { title: 'Numbers stay inspectable', body: 'Dashboard totals are computed from the records you imported, with heuristic insights labelled as signals.', label: 'Evidence boundary', icon: 'activity' },
];

const Testimonials = () => (
  <section className="landing-section">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">Designed for real review</span>
        <h2>Confidence comes from visible work.</h2>
        <p>These are interface guarantees you can check in the workspace—not invented customer outcomes.</p>
      </div>
      <div className="testimonials-grid">
        {REVIEW_CUES.map((cue) => (
          <article className="testimonial-card" key={cue.title}>
            <div>
              <Icon className="testimonial-quote-mark" name={cue.icon} size={25} />
              <span className="review-cue-label">{cue.label}</span>
              <h3>{cue.title}</h3>
              <p className="review-cue-body">{cue.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;

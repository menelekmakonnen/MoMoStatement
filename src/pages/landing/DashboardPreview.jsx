import React from 'react';
import { Icon } from '../../components/ui/Icon';

const DashboardPreview = () => (
  <section className="landing-section landing-context-section">
    <div className="landing-shell">
      <div className="context-grid">
        <div className="context-copy">
          <span className="public-eyebrow">The workspace after import</span>
          <h2>A useful overview without hiding the evidence.</h2>
          <p>Totals come from the records you imported. The statement stays one tap away, and every row can open back to its source.</p>
          <div className="context-actions">
            <a className="text-link" href="#demo">See the working sample <Icon name="arrowRight" size={15} /></a>
            <a className="text-link" href="#pricing">Read the beta boundary <Icon name="arrowRight" size={15} /></a>
          </div>
        </div>
        <div className="review-preview" aria-label="Illustrative statement review preview">
          <div className="review-preview-head"><span>Statement</span><span className="review-preview-count">3 imported rows</span></div>
          <div className="review-preview-summary"><span><small>Reported balance</small><strong>GHS 1,850.50</strong></span><span><small>Net movement</small><strong className="positive">+ GHS 145.00</strong></span></div>
          <div className="review-preview-row"><span className="preview-direction received"><Icon name="arrowDown" size={16} /></span><span><strong>Payment received</strong><small>Kweku Mensah · source attached</small></span><b className="positive">+420.00</b></div>
          <div className="review-preview-row"><span className="preview-direction sent"><Icon name="arrowUp" size={16} /></span><span><strong>Merchant payment</strong><small>Max Mart · fee GHS 1.00</small></span><b className="negative">−75.00</b></div>
          <div className="review-preview-row"><span className="preview-direction sent"><Icon name="arrowUp" size={16} /></span><span><strong>Cash out</strong><small>Kweku Stores · source attached</small></span><b className="negative">−200.00</b></div>
          <p className="review-preview-note"><Icon name="eye" size={14} /> Illustrative sample — imported values replace these rows.</p>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardPreview;

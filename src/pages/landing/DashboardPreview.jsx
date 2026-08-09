import React from 'react';
import { Icon } from '../../components/ui/Icon';

const DashboardPreview = () => (
  <section className="landing-section">
    <div className="landing-shell">
      <div className="public-section-head">
        <span className="public-eyebrow">One calm overview</span>
        <h2>Your money, with the important edges still visible.</h2>
        <p>The workspace gives you a useful summary without hiding the source rows, provider coverage, fees, or latest reported balance.</p>
      </div>

      <div className="dashboard-mockup" aria-label="MoMo Statement dashboard preview">
        <div className="mockup-header"><span className="mockup-dot dot-red" /><span className="mockup-dot dot-yellow" /><span className="mockup-dot dot-green" /><span className="mockup-mode">Illustrative sample — imported values replace these</span></div>
        <div className="mockup-content">
          <div className="mockup-stats">
            <div className="mockup-stat-card"><span>Latest balance</span><strong>GHS 2,450.00</strong></div>
            <div className="mockup-stat-card"><span>Received this month</span><strong className="positive">+ GHS 5,200.00</strong></div>
            <div className="mockup-stat-card"><span>Sent this month</span><strong className="negative">− GHS 3,150.00</strong></div>
          </div>

          <div className="mockup-chart-panel">
            <h4>Cash-flow trail</h4>
            <div className="mockup-chart" aria-label="Illustrative cash-flow bars" role="img">
              {[40, 70, 50, 90, 65, 80, 100].map((height, index) => <span className="chart-bar" style={{ height: `${height}%` }} key={index} />)}
            </div>
          </div>

          <div className="mockup-transactions">
            <h4>Recent transactions</h4>
            <div className="mockup-tx-row">
              <div className="mockup-tx-copy"><span className="mockup-tx-icon"><Icon name="arrowDown" size={15} /></span><span><strong>Payment received</strong><span>From Kweku Mensah</span></span></div>
              <strong className="mockup-tx-amount positive">+GHS 500.00</strong>
            </div>
            <div className="mockup-tx-row">
              <div className="mockup-tx-copy"><span className="mockup-tx-icon"><Icon name="arrowUp" size={15} /></span><span><strong>Merchant payment</strong><span>To Max Mart</span></span></div>
              <strong className="mockup-tx-amount">−GHS 45.00</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardPreview;

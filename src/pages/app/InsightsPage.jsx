import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { detectUnusual } from '../../lib/parser/classifier';
import { useTxnStore } from '../../stores/txnStore';

function formatMoney(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

function monthKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default function InsightsPage() {
  const transactions = useTxnStore((state) => state.transactions);
  const data = useMemo(() => {
    const expenses = transactions.filter((txn) => !isCredit(txn.type));
    const categories = expenses.reduce((map, txn) => {
      const key = txn.category || 'uncategorised';
      map[key] = (map[key] || 0) + (txn.amount || 0);
      return map;
    }, {});
    const counterparties = expenses.reduce((map, txn) => {
      const key = txn.counterpartyName || txn.counterparty || 'Unknown counterparty';
      map[key] = (map[key] || 0) + (txn.amount || 0);
      return map;
    }, {});
    const unusual = detectUnusual(transactions);
    const now = new Date();
    const current = transactions.filter((txn) => monthKey(txn.timestamp || txn.date) === monthKey(now));
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previous = transactions.filter((txn) => monthKey(txn.timestamp || txn.date) === monthKey(previousDate));
    const total = expenses.reduce((sum, txn) => sum + (txn.amount || 0), 0) || 1;
    return {
      categories: Object.entries(categories).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, amount]) => ({ name, amount, percent: (amount / total) * 100 })),
      counterparties: Object.entries(counterparties).sort(([, a], [, b]) => b - a).slice(0, 4),
      unusual,
      currentExpenses: current.filter((txn) => !isCredit(txn.type)).reduce((sum, txn) => sum + (txn.amount || 0), 0),
      previousExpenses: previous.filter((txn) => !isCredit(txn.type)).reduce((sum, txn) => sum + (txn.amount || 0), 0),
    };
  }, [transactions]);

  if (!transactions.length) {
    return (
      <section className="surface-card empty-state-card">
        <span className="empty-icon"><Icon name="insights" size={26} /></span>
        <h2>Insights follow the evidence</h2>
        <p>Import a statement first. We will only surface patterns that can be traced back to the records you provided.</p>
        <Link className="btn btn-primary" to="/app/import"><Icon name="upload" size={17} /> Import messages</Link>
      </section>
    );
  }

  const expenseDelta = data.previousExpenses ? ((data.currentExpenses - data.previousExpenses) / data.previousExpenses) * 100 : null;

  return (
    <div className="insights-page">
      <div className="page-intro">
        <div>
          <h2>Patterns worth noticing</h2>
          <p>These are observations from your imported records, not financial advice. Open the statement to verify any detail.</p>
        </div>
        <span className="badge badge-info"><Icon name="shield" size={14} /> Evidence-led</span>
      </div>

      <div className="insights-grid">
        <section className="surface-card insight-card">
          <div className="section-heading"><div><h3>Current month</h3><p>Compared with the previous month where available</p></div><Icon name="calendar" size={20} className="stat-accent" /></div>
          <strong className="stat-value">{formatMoney(data.currentExpenses)}</strong>
          <p>{expenseDelta === null ? 'There is not enough previous-month data for a comparison yet.' : `${Math.abs(expenseDelta).toFixed(1)}% ${expenseDelta >= 0 ? 'higher' : 'lower'} than the previous month.`}</p>
        </section>

        <section className="surface-card insight-card">
          <div className="section-heading"><div><h3>Top spending categories</h3><p>Ranked by outgoing amount</p></div><Icon name="dashboard" size={20} className="stat-accent" /></div>
          <div className="breakdown-list">
            {data.categories.length ? data.categories.map((item) => (
              <div className="breakdown-row" key={item.name}>
                <div className="breakdown-label"><span>{item.name}</span><span>{formatMoney(item.amount)}</span></div>
                <div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${item.percent}%` }} /></div>
              </div>
            )) : <p>No outgoing categories have been classified yet.</p>}
          </div>
        </section>

        <section className="surface-card insight-card">
          <div className="section-heading"><div><h3>Largest counterparties</h3><p>Useful for a quick review before export</p></div><Icon name="layers" size={20} className="stat-accent" /></div>
          <div className="breakdown-list">
            {data.counterparties.map(([name, amount]) => (
              <div className="breakdown-label" key={name}><span>{name}</span><span>{formatMoney(amount)}</span></div>
            ))}
          </div>
        </section>

        <section className="surface-card insight-card">
          <div className="section-heading"><div><h3>Review queue</h3><p>Heuristics to verify, not automatic accusations</p></div><Icon name="alert" size={20} className="stat-accent" /></div>
          {data.unusual.length ? (
            <div className="breakdown-list">
              {data.unusual.slice(0, 3).map((item) => (
                <div className="insight-callout" key={item.transaction.id}>
                  <Icon name="alert" size={17} />
                  <div><strong>{item.transaction.counterpartyName || 'Transaction to review'}</strong><p>{item.reason}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="insight-callout"><Icon name="checkCircle" size={17} /><div><strong>No unusual activity flagged</strong><p>The current heuristic pass found nothing that needs your attention.</p></div></div>
          )}
        </section>
      </div>
    </div>
  );
}

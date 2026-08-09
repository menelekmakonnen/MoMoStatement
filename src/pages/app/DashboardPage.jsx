import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { filterTransactions, getTransactionStats, useTxnStore } from '../../stores/txnStore';

function formatMoney(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function formatCompact(value) {
  return new Intl.NumberFormat('en-GH', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('en-GH', { month: 'short' }).format(date);
}

function buildMonthlyData(transactions) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (5 - index), 1));
  return months.map((date) => {
    const key = monthKey(date);
    const monthTransactions = transactions.filter((txn) => monthKey(new Date(txn.timestamp || txn.date)) === key);
    return {
      label: monthLabel(date),
      income: monthTransactions.filter((txn) => isCredit(txn.type)).reduce((sum, txn) => sum + (txn.amount || 0), 0),
      expense: monthTransactions.filter((txn) => !isCredit(txn.type)).reduce((sum, txn) => sum + (txn.amount || 0), 0),
    };
  });
}

function BarChart({ data }) {
  const max = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1);
  const chartWidth = 600;
  const chartHeight = 210;
  const groupWidth = chartWidth / data.length;
  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Income and expense by month">
      {[0.25, 0.5, 0.75, 1].map((line) => <line key={line} className="chart-grid-line" x1="0" x2={chartWidth} y1={chartHeight - (chartHeight - 22) * line} y2={chartHeight - (chartHeight - 22) * line} />)}
      {data.map((item, index) => {
        const x = index * groupWidth + groupWidth * 0.23;
        const incomeHeight = (item.income / max) * (chartHeight - 42);
        const expenseHeight = (item.expense / max) * (chartHeight - 42);
        return (
          <g key={item.label}>
            <rect className="chart-bar" x={x} y={chartHeight - incomeHeight - 22} width={groupWidth * 0.18} height={incomeHeight} />
            <rect className="chart-bar secondary" x={x + groupWidth * 0.22} y={chartHeight - expenseHeight - 22} width={groupWidth * 0.18} height={expenseHeight} />
            <text x={index * groupWidth + groupWidth / 2} y={chartHeight - 4} textAnchor="middle" fill="var(--ink-muted)" fontSize="11">{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function BalanceChart({ transactions }) {
  const ordered = [...transactions].sort((a, b) => new Date(a.timestamp || a.date) - new Date(b.timestamp || b.date));
  const points = ordered.slice(-12);
  if (!points.length) return null;
  const width = 600;
  const height = 210;
  const values = points.map((point) => Number(point.balance) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values, min + 1);
  const x = (index) => (index / Math.max(points.length - 1, 1)) * width;
  const y = (value) => height - 28 - ((value - min) / (max - min)) * (height - 54);
  const line = points.map((point, index) => `${x(index)},${y(Number(point.balance) || 0)}`).join(' ');
  const area = `0,${height - 28} ${line} ${width},${height - 28}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Balance over imported transactions">
      <defs>
        <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d4a847" stopOpacity=".45" />
          <stop offset="1" stopColor="#d4a847" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((linePosition) => <line key={linePosition} className="chart-grid-line" x1="0" x2={width} y1={height - 28 - (height - 54) * linePosition} y2={height - 28 - (height - 54) * linePosition} />)}
      <polygon className="chart-area" points={area} />
      <polyline className="chart-line" points={line} />
      {points.map((point, index) => <circle key={`${point.id}-${index}`} cx={x(index)} cy={y(Number(point.balance) || 0)} r="4" fill="#141414" stroke="#f3d98b" strokeWidth="2" />)}
      <text x="0" y={height - 4} fill="var(--ink-muted)" fontSize="11">Older</text>
      <text x={width} y={height - 4} textAnchor="end" fill="var(--ink-muted)" fontSize="11">Latest</text>
    </svg>
  );
}

function EmptyDashboard({ filtered = false, onClear }) {
  return (
    <section className="surface-card empty-state-card">
      <span className="empty-icon"><Icon name="dashboard" size={26} /></span>
      <h2>{filtered ? 'No dashboard records match those filters' : 'There is nothing to summarise yet'}</h2>
      <p>{filtered ? 'Clear the current search or filters to return to the full imported statement.' : 'Import a few messages first. Your dashboard will then show real cash flow, balances, fees, and provider coverage.'}</p>
      {filtered ? (
        <button className="btn btn-secondary" type="button" onClick={onClear}>Clear filters</button>
      ) : (
        <Link className="btn btn-primary" to="/app/import"><Icon name="upload" size={17} /> Import messages</Link>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const transactions = useTxnStore((state) => state.transactions);
  const filters = useTxnStore((state) => state.filters);
  const resetFilters = useTxnStore((state) => state.resetFilters);
  const visibleTransactions = useMemo(
    () => filterTransactions(transactions, filters),
    [filters, transactions],
  );
  const stats = useMemo(() => getTransactionStats(transactions, filters), [filters, transactions]);
  const monthlyData = useMemo(() => buildMonthlyData(visibleTransactions), [visibleTransactions]);
  const providerData = useMemo(() => {
    const counts = visibleTransactions.reduce((map, txn) => {
      map[txn.provider] = (map[txn.provider] || 0) + (txn.amount || 0);
      return map;
    }, {});
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(counts).sort(([, a], [, b]) => b - a).map(([provider, value]) => ({ provider, value, percent: (value / total) * 100 }));
  }, [visibleTransactions]);

  if (!transactions.length) return <EmptyDashboard />;
  if (!visibleTransactions.length) return <EmptyDashboard filtered onClear={resetFilters} />;

  const net = stats.totalIn - stats.totalOut;
  const latest = [...visibleTransactions].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)).slice(0, 4);

  return (
    <div className="dashboard-page">
      <div className="page-intro">
        <div>
          <h2>Money, without the fog</h2>
          <p>Numbers are computed from the records you imported. Search filters in the header apply here too.</p>
        </div>
        <span className="badge badge-success"><Icon name="activity" size={14} /> {stats.count} records analysed</span>
      </div>

      <div className="stat-grid">
        <section className="surface-card stat-card">
          <div className="stat-label"><span>Total received</span><Icon name="arrowDown" size={17} className="stat-positive" /></div>
          <strong className="stat-value stat-positive">{formatMoney(stats.totalIn)}</strong>
          <span className="stat-detail">Across all imported credits</span>
        </section>
        <section className="surface-card stat-card">
          <div className="stat-label"><span>Total sent</span><Icon name="arrowUp" size={17} className="stat-negative" /></div>
          <strong className="stat-value stat-negative">{formatMoney(stats.totalOut)}</strong>
          <span className="stat-detail">Payments, transfers, and cash out</span>
        </section>
        <section className="surface-card stat-card">
          <div className="stat-label"><span>Net cash flow</span><Icon name="activity" size={17} className="stat-accent" /></div>
          <strong className={`stat-value ${net >= 0 ? 'stat-positive' : 'stat-negative'}`}>{formatMoney(net)}</strong>
          <span className="stat-detail">Received minus sent</span>
        </section>
        <section className="surface-card stat-card">
          <div className="stat-label"><span>Fees recorded</span><Icon name="layers" size={17} className="stat-accent" /></div>
          <strong className="stat-value">{formatMoney(stats.feeTotal)}</strong>
          <span className="stat-detail">{formatCompact(stats.count)} transaction records</span>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="surface-card chart-card chart-card-wide">
          <div className="section-heading">
            <div><h3>Cash flow by month</h3><p>Credits and debits from imported messages</p></div>
            <div className="chart-legend"><span><i className="legend-dot" /> Received</span><span><i className="legend-dot secondary" /> Sent</span></div>
          </div>
          <div className="chart-shell"><BarChart data={monthlyData} /></div>
        </section>
        <section className="surface-card chart-card">
          <div className="section-heading"><div><h3>Balance trail</h3><p>Latest balance reported by your provider</p></div></div>
          <div className="chart-shell"><BalanceChart transactions={visibleTransactions} /></div>
        </section>
        <section className="surface-card chart-card">
          <div className="section-heading"><div><h3>Provider coverage</h3><p>Value represented in this workspace</p></div></div>
          <div className="breakdown-list">
            {providerData.map((item) => (
              <div className="breakdown-row" key={item.provider}>
                <div className="breakdown-label"><span>{item.provider}</span><span>{formatMoney(item.value)}</span></div>
                <div className="breakdown-track"><div className="breakdown-fill" style={{ width: `${item.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="surface-card chart-card chart-card-wide">
          <div className="section-heading"><div><h3>Recent activity</h3><p>Raw source remains available on each row in the statement.</p></div><Link to="/app/statement" className="btn btn-ghost">View all <Icon name="arrowRight" size={15} /></Link></div>
          <div className="transaction-list">
            {latest.map((txn) => (
              <div key={txn.id} className="transaction-row">
                <div className="transaction-main">
                  <span className={`transaction-kind ${isCredit(txn.type) ? 'credit' : 'debit'}`}><Icon name={isCredit(txn.type) ? 'arrowDown' : 'arrowUp'} size={18} /></span>
                  <div className="transaction-name"><strong>{txn.counterpartyName || txn.counterparty || 'Unknown counterparty'}</strong><span>{txn.provider} · {txn.type}</span></div>
                </div>
                <div className="transaction-meta"><strong>{txn.reference || txn.txnId || 'No reference'}</strong><span>{txn.category || 'Uncategorised'}</span></div>
                <div className="transaction-amount"><strong className={isCredit(txn.type) ? 'credit' : 'debit'}>{isCredit(txn.type) ? '+' : '-'}{formatMoney(txn.amount)}</strong><span>Balance {formatMoney(txn.balance)}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { filterTransactions, useTxnStore } from '../../stores/txnStore';

const TYPE_OPTIONS = [
  ['All', 'All transaction types'],
  ['RECEIVED', 'Received'],
  ['CASH_IN', 'Cash in'],
  ['SENT', 'Sent'],
  ['MERCHANT', 'Merchant payment'],
  ['AIRTIME', 'Airtime'],
  ['CASH_OUT', 'Cash out'],
];

const CATEGORY_OPTIONS = [
  ['All', 'All categories'],
  ['income', 'Income'],
  ['expense', 'Expense'],
  ['transfer', 'Transfer'],
  ['utility', 'Utility'],
];

const PERIOD_OPTIONS = [
  ['all', 'All time'],
  ['month', 'This month'],
  ['30d', 'Last 30 days'],
  ['90d', 'Last 90 days'],
];

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS);
const PROVIDER_LABELS = { MTN: 'MTN', TELECEL: 'Telecel', AIRTELTIGO: 'AirtelTigo' };

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not reported';
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function formatDate(value) {
  if (value === null || value === undefined || value === '') return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : new Intl.DateTimeFormat('en-GH', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCounterparty(txn) {
  return txn.counterpartyName || txn.counterparty || 'Unknown counterparty';
}

function formatType(type) {
  return TYPE_LABELS[type] || type || 'Transaction';
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

function TransactionRow({ txn }) {
  const credit = isCredit(txn.type);
  const name = getCounterparty(txn);
  const timestamp = txn.timestamp ?? txn.date;
  const rawSource = txn.rawBody || txn.raw || txn.body;
  return (
    <article className="transaction-row">
      <div className="transaction-main">
        <span className={`transaction-kind ${credit ? 'credit' : 'debit'}`} aria-hidden="true">
          <Icon name={credit ? 'arrowDown' : 'arrowUp'} size={19} />
        </span>
        <div className="transaction-name">
          <strong>{name}</strong>
          <span>{formatDate(timestamp)}{txn.timestampIsInferred ? ' · inferred' : ''} · {PROVIDER_LABELS[txn.provider] || txn.provider} · {formatType(txn.type)}</span>
        </div>
      </div>
      <div className="transaction-meta">
        <strong>{txn.reference || txn.txnId || 'No reference'}</strong>
        <span>{txn.category || 'Uncategorised'}{txn.fee ? ` · fee ${formatMoney(txn.fee)}` : ''}</span>
      </div>
      <div className="transaction-amount">
        <strong className={credit ? 'credit' : 'debit'}>{credit ? '+' : '−'}{formatMoney(txn.amount)}</strong>
        <span>Balance {formatMoney(txn.balance)}</span>
      </div>
      <details className="transaction-details">
        <summary><span>View source and details</span><Icon name="chevronDown" size={15} /></summary>
        <div className="transaction-detail-body">
          <dl className="transaction-detail-grid">
            <div><dt>Provider</dt><dd>{PROVIDER_LABELS[txn.provider] || txn.provider || 'Unknown'}</dd></div>
            <div><dt>Type</dt><dd>{formatType(txn.type)}</dd></div>
            <div><dt>Fee</dt><dd>{formatMoney(txn.fee)}</dd></div>
            <div><dt>Tax</dt><dd>{formatMoney(txn.tax)}</dd></div>
            <div><dt>Reference</dt><dd>{txn.reference || txn.txnId || 'Not available'}</dd></div>
            <div><dt>Reported balance</dt><dd>{formatMoney(txn.balance)}</dd></div>
            <div><dt>Date provenance</dt><dd>{txn.timestampIsInferred ? 'Inferred at import' : formatDate(timestamp)}</dd></div>
            <div><dt>Source</dt><dd>{txn.source || 'Imported message'}</dd></div>
          </dl>
          {rawSource && <div className="transaction-raw"><span>Original source</span><pre>{rawSource}</pre></div>}
        </div>
      </details>
    </article>
  );
}

export default function StatementPage() {
  const transactions = useTxnStore((state) => state.transactions);
  const filters = useTxnStore((state) => state.filters);
  const setFilter = useTxnStore((state) => state.setFilter);
  const resetFilters = useTxnStore((state) => state.resetFilters);
  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, filters),
    [filters, transactions],
  );

  const hasFilters = Boolean(filters.search || filters.provider !== 'All' || filters.type !== 'All' || filters.category !== 'All' || filters.startDate || filters.endDate);
  const [period, setPeriod] = useState('all');

  const applyPeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    if (nextPeriod === 'all') {
      setFilter('startDate', null);
      setFilter('endDate', null);
      return;
    }
    const end = new Date();
    const start = new Date(end);
    if (nextPeriod === 'month') start.setDate(1);
    if (nextPeriod === '30d') start.setDate(start.getDate() - 29);
    if (nextPeriod === '90d') start.setDate(start.getDate() - 89);
    setFilter('startDate', toInputDate(start));
    setFilter('endDate', toInputDate(end));
  };

  const clearFilters = () => {
    setPeriod('all');
    resetFilters();
  };

  if (transactions.length === 0) {
    return (
      <div className="statement-page">
        <div className="page-intro">
          <div>
            <h2>Your statement</h2>
            <p>Parsed transactions will stay searchable here after your first import.</p>
          </div>
        </div>
        <section className="surface-card empty-state-card">
          <span className="empty-icon"><Icon name="document" size={26} /></span>
          <h2>No transactions yet</h2>
          <p>Paste a few MoMo messages or try the isolated sample on the home page to see the full review flow.</p>
          <Link className="btn btn-primary" to="/app/import"><Icon name="upload" size={17} /> Import messages</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="statement-page">
      <div className="page-intro">
        <div>
          <h2>Your statement</h2>
          <p>Search by counterparty, reference, phone number, or transaction ID. Every amount remains exact.</p>
        </div>
        <span className="badge badge-neutral"><Icon name="layers" size={14} /> {transactions.length} imported</span>
      </div>

      <div className="statement-toolbar">
        <label className="statement-search">
          <span className="sr-only">Search statement</span>
          <div className="input-wrapper">
            <Icon name="search" size={17} className="input-icon-left" />
            <input className="input input-with-icon" type="search" placeholder="Search counterparties or references" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
          </div>
        </label>
        <span className="statement-count">{filteredTransactions.length} of {transactions.length} shown</span>
      </div>

      <div className="period-row" aria-label="Quick date range">
        {PERIOD_OPTIONS.map(([value, label]) => (
          <button className={`filter-chip ${period === value ? 'active' : ''}`} type="button" aria-pressed={period === value} key={value} onClick={() => applyPeriod(value)}>{label}</button>
        ))}
      </div>

      <div className="filter-row" aria-label="Statement filters">
        <label className="sr-only" htmlFor="provider-filter">Provider</label>
        <select id="provider-filter" className="input filter-select" value={filters.provider} onChange={(event) => setFilter('provider', event.target.value)}>
          <option value="All">All providers</option>
          <option value="MTN">MTN</option>
          <option value="TELECEL">Telecel</option>
          <option value="AIRTELTIGO">AirtelTigo</option>
        </select>
        <label className="sr-only" htmlFor="type-filter">Transaction type</label>
        <select id="type-filter" className="input filter-select" value={filters.type} onChange={(event) => setFilter('type', event.target.value)}>
          {TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="sr-only" htmlFor="category-filter">Category</label>
        <select id="category-filter" className="input filter-select" value={filters.category} onChange={(event) => setFilter('category', event.target.value)}>
          {CATEGORY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <label className="date-filter"><span>From</span><input className="input" type="date" value={filters.startDate || ''} onChange={(event) => { setPeriod('custom'); setFilter('startDate', event.target.value || null); }} /></label>
        <label className="date-filter"><span>To</span><input className="input" type="date" value={filters.endDate || ''} onChange={(event) => { setPeriod('custom'); setFilter('endDate', event.target.value || null); }} /></label>
        {hasFilters && <button className="btn btn-ghost" type="button" onClick={clearFilters}><Icon name="refresh" size={15} /> Clear filters</button>}
      </div>

      {filteredTransactions.length === 0 ? (
        <section className="surface-card empty-state-card">
          <span className="empty-icon"><Icon name="search" size={26} /></span>
          <h3>No matching transactions</h3>
          <p>Try a broader search or clear the filters to return to the full statement.</p>
          <button className="btn btn-secondary" type="button" onClick={clearFilters}>Clear filters</button>
        </section>
      ) : (
        <div className="transaction-list" aria-label="Parsed transactions">
          {filteredTransactions.map((txn) => <TransactionRow key={txn.id} txn={txn} />)}
        </div>
      )}
    </div>
  );
}

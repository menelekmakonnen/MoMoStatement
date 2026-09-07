import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Icon } from '../../components/ui/Icon';
import { filterTransactions, useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not reported';
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function getCounterparty(txn) {
  return txn.counterpartyName || txn.counterparty || 'Unknown counterparty';
}

function getDate(txn) {
  return txn.timestamp ?? txn.date ?? null;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
}

function downloadText(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const transactions = useTxnStore((state) => state.transactions);
  const filters = useTxnStore((state) => state.filters);
  const addToast = useUIStore((state) => state.addToast);
  const [range, setRange] = useState('all');
  const [scope, setScope] = useState('current');

  const exportTransactions = useMemo(() => {
    const scoped = scope === 'all' ? transactions : filterTransactions(transactions, filters);
    if (range === 'all') return scoped;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return scoped.filter((txn) => {
      const timestamp = getDate(txn);
      const time = timestamp ? new Date(timestamp).getTime() : Number.NaN;
      return Number.isFinite(time) && time >= cutoff;
    });
  }, [filters, range, scope, transactions]);

  const exportDate = new Date().toISOString().slice(0, 10);
  const scopeLabel = scope === 'all' ? 'Entire workspace' : 'Current filters';
  const rangeLabel = { all: 'All imported records', '30d': 'Last 30 days', '90d': 'Last 90 days', '365d': 'Last 12 months' }[range];

  const handleCsv = () => {
    if (!exportTransactions.length) {
      addToast({ level: 'warning', message: 'There are no transactions in the selected range.' });
      return;
    }
    const headers = ['Date', 'Provider', 'Type', 'Counterparty', 'Amount (GHS)', 'Fee (GHS)', 'Balance (GHS)', 'Category', 'Reference'];
    const rows = exportTransactions.map((txn) => [
      getDate(txn) ? new Date(getDate(txn)).toISOString() : '', txn.provider, txn.type, getCounterparty(txn), txn.amount, txn.fee || 0, txn.balance ?? '', txn.category || '', txn.reference || txn.txnId || '',
    ]);
    downloadText([headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n'), `momo-statement-${exportDate}.csv`, 'text/csv;charset=utf-8');
    addToast({ level: 'success', message: 'CSV statement downloaded.' });
  };

  const handleJson = () => {
    if (!exportTransactions.length) {
      addToast({ level: 'warning', message: 'There are no transactions in the selected range.' });
      return;
    }
    const payload = { app: 'MoMo Statement', exportedAt: new Date().toISOString(), scope, range, count: exportTransactions.length, transactions: exportTransactions };
    downloadText(JSON.stringify(payload, null, 2), `momo-statement-${exportDate}.json`, 'application/json');
    addToast({ level: 'success', message: 'JSON backup downloaded.' });
  };

  const handlePdf = () => {
    if (!exportTransactions.length) {
      addToast({ level: 'warning', message: 'There are no transactions in the selected range.' });
      return;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 42;
    let y = 0;
    let pageNumber = 0;
    const startPage = () => {
      pageNumber += 1;
      doc.setFillColor(247, 245, 239);
      doc.rect(0, 0, 595, 842, 'F');
      doc.setTextColor(23, 23, 20);
      doc.setFontSize(20);
      doc.text('MoMo Statement', margin, 52);
      doc.setTextColor(82, 82, 72);
      doc.setFontSize(9);
      doc.text(`Generated ${new Date().toLocaleDateString('en-GH')} · ${exportTransactions.length} records · ${scopeLabel} · ${rangeLabel}`, margin, 71);
      doc.setDrawColor(202, 197, 184);
      doc.line(margin, 88, 553, 88);
      doc.setTextColor(23, 23, 20);
      doc.setFontSize(9);
      y = 113;
    };

    startPage();
    exportTransactions.forEach((txn, index) => {
      if (y > 770) {
        doc.setTextColor(82, 82, 72);
        doc.setFontSize(8);
        doc.text(`Page ${pageNumber}`, 553, 816, { align: 'right' });
        doc.addPage();
        startPage();
      }
      const amount = `${isCredit(txn.type) ? '+' : '-'}${formatMoney(txn.amount)}`;
      const dateLabel = getDate(txn) ? new Date(getDate(txn)).toLocaleDateString('en-GH') : 'Unknown date';
      const line = `${index + 1}. ${dateLabel}  ${getCounterparty(txn).slice(0, 26)}  ${amount}`;
      doc.text(line, margin, y);
      doc.setTextColor(86, 92, 82);
      doc.text(`${txn.provider} · ${txn.type} · balance ${formatMoney(txn.balance)}`, margin + 8, y + 12);
      doc.setTextColor(23, 25, 22);
      y += 28;
    });
    doc.setTextColor(82, 82, 72);
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber} · ${exportTransactions.length} of ${exportTransactions.length} selected records included`, margin, 816);
    doc.save(`momo-statement-${exportDate}.pdf`);
    addToast({ level: 'success', message: `PDF statement downloaded with ${exportTransactions.length} records.` });
  };

  const isEmpty = !transactions.length;
  return (
    <div className="export-page">
      <div className="page-intro">
        <div>
          <h2>Take your statement with you</h2>
          <p>Choose the records to carry forward. The selected scope and date range stay visible in each export.</p>
        </div>
        <span className="badge badge-neutral"><Icon name="lock" size={14} /> {scopeLabel}</span>
      </div>

      <section className="surface-card export-scope-card">
        <div>
          <h3>Export scope</h3>
          <p><strong>{exportTransactions.length} records</strong> · {scopeLabel} · {rangeLabel}{range !== 'all' ? ' (records without a source date are excluded)' : ''}</p>
        </div>
        <div className="export-scope-options" role="group" aria-label="Export scope">
          <label className={`scope-option ${scope === 'current' ? 'active' : ''}`}>
            <input type="radio" name="export-scope" value="current" checked={scope === 'current'} onChange={() => setScope('current')} />
            <span><strong>Current filters</strong><small>Follow the statement filters.</small></span>
          </label>
          <label className={`scope-option ${scope === 'all' ? 'active' : ''}`}>
            <input type="radio" name="export-scope" value="all" checked={scope === 'all'} onChange={() => setScope('all')} />
            <span><strong>Entire workspace</strong><small>Include every imported record.</small></span>
          </label>
        </div>
      </section>

      <div className="export-grid">
        <section className="surface-card export-card">
          <span className="export-card-icon"><Icon name="pdf" size={23} /></span>
          <h3>PDF statement</h3>
          <p>A paginated, shareable summary for a reviewer. Every selected record is included.</p>
          <button className="btn btn-primary" type="button" disabled={isEmpty} onClick={handlePdf}>Download PDF</button>
        </section>
        <section className="surface-card export-card">
          <span className="export-card-icon"><Icon name="csv" size={23} /></span>
          <h3>CSV statement</h3>
          <p>Exact rows for accounting, spreadsheets, or further analysis. Formula-like text is escaped on export.</p>
          <button className="btn btn-secondary" type="button" disabled={isEmpty} onClick={handleCsv}>Download CSV</button>
        </section>
        <section className="surface-card export-card">
          <span className="export-card-icon"><Icon name="copy" size={23} /></span>
          <h3>JSON backup</h3>
          <p>A faithful local backup that preserves parser metadata, references, balances, and raw source fields.</p>
          <button className="btn btn-secondary" type="button" disabled={isEmpty} onClick={handleJson}>Download JSON</button>
        </section>
      </div>

      <section className="surface-card date-range-card">
        <div><h3>Export range</h3><p>{exportTransactions.length} records will be included from the selected scope.</p></div>
        <label>
          <span className="sr-only">Choose export range</span>
          <select className="input" value={range} onChange={(event) => setRange(event.target.value)}>
            <option value="all">All imported records</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last 12 months</option>
          </select>
        </label>
      </section>
    </div>
  );
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

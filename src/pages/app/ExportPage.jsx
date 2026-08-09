import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Icon } from '../../components/ui/Icon';
import { filterTransactions, useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

function formatMoney(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function getCounterparty(txn) {
  return txn.counterpartyName || txn.counterparty || 'Unknown counterparty';
}

function getDate(txn) {
  return txn.timestamp || txn.date || Date.now();
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

  const exportTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, filters);
    if (range === 'all') return filtered;
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return filtered.filter((txn) => new Date(getDate(txn)).getTime() >= cutoff);
  }, [filters, range, transactions]);

  const exportDate = new Date().toISOString().slice(0, 10);

  const handleCsv = () => {
    if (!exportTransactions.length) {
      addToast({ level: 'warning', message: 'There are no transactions in the selected range.' });
      return;
    }
    const headers = ['Date', 'Provider', 'Type', 'Counterparty', 'Amount (GHS)', 'Fee (GHS)', 'Balance (GHS)', 'Category', 'Reference'];
    const rows = exportTransactions.map((txn) => [
      new Date(getDate(txn)).toISOString(), txn.provider, txn.type, getCounterparty(txn), txn.amount, txn.fee || 0, txn.balance || 0, txn.category || '', txn.reference || txn.txnId || '',
    ]);
    downloadText([headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n'), `momo-statement-${exportDate}.csv`, 'text/csv;charset=utf-8');
    addToast({ level: 'success', message: 'CSV statement downloaded.' });
  };

  const handleJson = () => {
    if (!exportTransactions.length) {
      addToast({ level: 'warning', message: 'There are no transactions in the selected range.' });
      return;
    }
    const payload = { app: 'MoMo Statement', exportedAt: new Date().toISOString(), range, count: exportTransactions.length, transactions: exportTransactions };
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
    let y = 52;
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 595, 842, 'F');
    doc.setTextColor(243, 217, 139);
    doc.setFontSize(20);
    doc.text('MoMo Statement', margin, y);
    y += 19;
    doc.setTextColor(192, 192, 192);
    doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleDateString('en-GH')} · ${exportTransactions.length} records · ${range}`, margin, y);
    y += 30;
    doc.setDrawColor(70, 70, 70);
    doc.line(margin, y, 553, y);
    y += 22;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    exportTransactions.slice(0, 34).forEach((txn) => {
      if (y > 790) return;
      const amount = `${isCredit(txn.type) ? '+' : '-'}${formatMoney(txn.amount)}`;
      const line = `${new Date(getDate(txn)).toLocaleDateString('en-GH')}  ${getCounterparty(txn).slice(0, 26)}  ${amount}`;
      doc.text(line, margin, y);
      doc.setTextColor(150, 150, 150);
      doc.text(`${txn.provider} · ${txn.type} · balance ${formatMoney(txn.balance)}`, margin + 8, y + 12);
      doc.setTextColor(255, 255, 255);
      y += 28;
    });
    if (exportTransactions.length > 34) {
      doc.setTextColor(192, 192, 192);
      doc.text(`Showing the first 34 of ${exportTransactions.length} records. Use CSV for the complete export.`, margin, 810);
    }
    doc.save(`momo-statement-${exportDate}.pdf`);
    addToast({ level: 'success', message: 'PDF statement downloaded.' });
  };

  const isEmpty = !transactions.length;
  return (
    <div className="export-page">
      <div className="page-intro">
        <div>
          <h2>Take your statement with you</h2>
          <p>Exports use the current statement filters and keep the selected range visible in the file metadata.</p>
        </div>
        <span className="badge badge-neutral"><Icon name="lock" size={14} /> Local export</span>
      </div>

      <div className="export-grid">
        <section className="surface-card export-card">
          <span className="export-card-icon"><Icon name="pdf" size={23} /></span>
          <h3>PDF statement</h3>
          <p>A concise, shareable summary for a reviewer. CSV remains the complete machine-readable record.</p>
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
        <div><h3>Export range</h3><p>{exportTransactions.length} records will be included.</p></div>
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

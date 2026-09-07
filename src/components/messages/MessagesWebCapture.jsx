import React, { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { useMessagesWebCapture } from '../../hooks/useMessagesWebCapture';
import { useUIStore } from '../../stores/uiStore';

const PROVIDERS = [
  ['MTN', 'MTN'],
  ['TELECEL', 'Telecel'],
  ['AIRTELTIGO', 'AirtelTigo'],
];

function statusLabel(status) {
  return {
    checking: 'Checking for helper',
    unavailable: 'Helper not detected',
    ready: 'Ready to capture',
    'awaiting-google': 'Waiting for Google Messages',
    'needs-confirmation': 'Google needs confirmation',
    starting: 'Starting capture',
    running: 'Capturing locally',
    stopping: 'Stopping capture',
    completed: 'Capture complete',
    error: 'Capture stopped',
  }[status] || 'Capture status';
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not reported';
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

function reviewReason(transaction, isAmbiguous) {
  if (isAmbiguous) return 'Similar payment already exists';
  if (transaction.timestampIsInferred || !(transaction.timestamp ?? transaction.date)) return 'Date is inferred or unavailable';
  if (transaction.balance === null || transaction.balance === undefined) return 'Balance not reported';
  if (!transaction.counterpartyName || transaction.counterpartyName === 'Unknown counterparty') return 'Counterparty not identified';
  if (!(transaction.reference || transaction.txnId)) return 'No reference or transaction ID';
  return 'Ready to review';
}

export default function MessagesWebCapture() {
  const capture = useMessagesWebCapture();
  const addToast = useUIStore((state) => state.addToast);
  const [providers, setProviders] = useState(PROVIDERS.map(([code]) => code));
  const [selectedCaptureIds, setSelectedCaptureIds] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const excludedCaptureIdsRef = React.useRef(new Set());
  const isRunning = ['starting', 'running', 'stopping'].includes(capture.status);
  const canStart = ['ready', 'completed', 'error'].includes(capture.status) && providers.length > 0 && capture.pendingTransactions.length === 0;
  const reviewPageSize = 20;
  const reviewPageCount = Math.max(1, Math.ceil(capture.pendingTransactions.length / reviewPageSize));
  const reviewPageStart = reviewPage * reviewPageSize;
  const reviewRows = capture.pendingTransactions.slice(reviewPageStart, reviewPageStart + reviewPageSize);
  const selectedCount = capture.pendingTransactions.filter((transaction) => selectedCaptureIds.includes(transaction.id)).length;

  useEffect(() => {
    const pendingIds = new Set(capture.pendingTransactions.map((transaction) => transaction.id));
    setSelectedCaptureIds((current) => [
      ...current.filter((id) => pendingIds.has(id) && !excludedCaptureIdsRef.current.has(id)),
      ...capture.pendingTransactions
        .map((transaction) => transaction.id)
        .filter((id) => !current.includes(id) && !excludedCaptureIdsRef.current.has(id)),
    ]);
  }, [capture.pendingTransactions]);

  useEffect(() => {
    setReviewPage((current) => Math.min(current, reviewPageCount - 1));
  }, [reviewPageCount]);

  const toggleProvider = (code) => {
    setProviders((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  };

  const handleAddCaptured = () => {
    const outcome = capture.addCapturedTransactions(selectedCaptureIds);
    selectedCaptureIds.forEach((id) => excludedCaptureIdsRef.current.delete(id));
    if (outcome.persisted) {
      addToast({ level: 'success', message: `${outcome.addedCount || 0} captured transaction${outcome.addedCount === 1 ? '' : 's'} added to your statement.` });
    } else {
      addToast({ level: 'warning', message: 'Captured rows were kept for this session, but the browser could not save them.' });
    }
  };

  const toggleCaptureSelection = (id) => {
    setSelectedCaptureIds((current) => {
      if (current.includes(id)) {
        excludedCaptureIdsRef.current.add(id);
        return current.filter((item) => item !== id);
      }
      excludedCaptureIdsRef.current.delete(id);
      return [...current, id];
    });
  };

  const handleSelectAll = () => {
    excludedCaptureIdsRef.current.clear();
    setSelectedCaptureIds(capture.pendingTransactions.map((transaction) => transaction.id));
  };

  const handleSelectNone = () => {
    capture.pendingTransactions.forEach((transaction) => excludedCaptureIdsRef.current.add(transaction.id));
    setSelectedCaptureIds([]);
  };

  return (
    <section className="messages-capture-card" aria-labelledby="messages-capture-title">
      <div className="messages-capture-header">
        <div>
          <span className="eyebrow"><Icon name="shield" size={14} /> Local browser capture</span>
          <h3 id="messages-capture-title">Capture available MoMo messages</h3>
          <p>Google keeps sign-in and pairing in its own tab. After you start, the helper loads older rendered conversations and sends only provider-matched, transaction-shaped messages to this local parser for staged review.</p>
        </div>
        <span className={`badge ${capture.status === 'error' ? 'badge-error' : capture.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>
          {statusLabel(capture.status)}
        </span>
      </div>

      <div className="messages-capture-actions">
        <button className="btn btn-secondary" type="button" onClick={capture.openGoogleMessages}>
          <Icon name="external" size={16} /> Open Google Messages
        </button>
        <div className="messages-provider-filter" aria-label="Networks to capture">
          {PROVIDERS.map(([code, label]) => (
            <label key={code} className="capture-provider-option">
              <input type="checkbox" checked={providers.includes(code)} onChange={() => toggleProvider(code)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="messages-capture-progress" role="status" aria-live="polite">
        <strong>{capture.message}</strong>
        {(capture.inspected > 0 || capture.matched > 0 || capture.imported > 0) && (
          <span>{capture.threads} conversations · {capture.inspected} messages checked · {capture.matched} relevant · {capture.imported} new rows staged</span>
        )}
      </div>

      {capture.pendingTransactions.length > 0 && (
        <div className="messages-capture-review" aria-live="polite">
          <div className="messages-capture-review-heading">
            <div>
              <strong>{capture.pendingTransactions.length} new row{capture.pendingTransactions.length === 1 ? '' : 's'} staged for review</strong>
              <span>Nothing from this scan has been added to your statement yet.</span>
            </div>
            <div className="messages-capture-review-heading-actions">
              <span className="badge badge-neutral">{capture.duplicateCount} duplicate{capture.duplicateCount === 1 ? '' : 's'} skipped</span>
              <button className="btn btn-ghost btn-sm" type="button" onClick={handleSelectAll}>Select all</button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={handleSelectNone}>Select none</button>
            </div>
          </div>
          <div className="messages-capture-review-list">
            {reviewRows.map((transaction) => (
              <div className="messages-capture-review-row" key={transaction.id}>
                <div className="messages-capture-review-line">
                  <label className="messages-capture-review-select">
                    <input
                      type="checkbox"
                      checked={selectedCaptureIds.includes(transaction.id)}
                      aria-label={`Include ${transaction.counterpartyName || 'Unknown counterparty'} ${formatMoney(transaction.amount)}`}
                      onChange={() => toggleCaptureSelection(transaction.id)}
                    />
                    <span><strong>{transaction.counterpartyName || 'Unknown counterparty'}</strong><small>{transaction.provider} · {transaction.type} · {reviewReason(transaction, capture.ambiguousTransactionIds.includes(transaction.id))}</small></span>
                  </label>
                  <b className={isCredit(transaction.type) ? 'credit' : 'debit'}>{isCredit(transaction.type) ? '+' : '−'}{formatMoney(transaction.amount)}</b>
                </div>
                <details className="messages-capture-review-source">
                  <summary>View source</summary>
                  <pre>{transaction.rawBody || 'Source text was not supplied.'}</pre>
                </details>
              </div>
            ))}
          </div>
          {reviewPageCount > 1 && (
            <div className="messages-capture-review-pagination" aria-label="Staged capture pages">
              <button className="btn btn-ghost btn-sm" type="button" disabled={reviewPage === 0} onClick={() => setReviewPage((current) => Math.max(0, current - 1))}>Previous</button>
              <span>Rows {reviewPageStart + 1}–{Math.min(reviewPageStart + reviewPageSize, capture.pendingTransactions.length)} of {capture.pendingTransactions.length} · Page {reviewPage + 1} of {reviewPageCount}</span>
              <button className="btn btn-ghost btn-sm" type="button" disabled={reviewPage >= reviewPageCount - 1} onClick={() => setReviewPage((current) => Math.min(reviewPageCount - 1, current + 1))}>Next</button>
            </div>
          )}
          <div className="messages-capture-review-actions">
            <button className="btn btn-ghost" type="button" onClick={() => { excludedCaptureIdsRef.current.clear(); capture.discardCapturedTransactions(); }}>Discard staged rows</button>
            <button className="btn btn-primary" type="button" disabled={!selectedCount} onClick={handleAddCaptured}><Icon name="checkCircle" size={16} /> Add {selectedCount} selected row{selectedCount === 1 ? '' : 's'}</button>
          </div>
        </div>
      )}

      {capture.status === 'unavailable' && (
        <div className="messages-capture-setup" role="note">
          <strong>One-time setup</strong>
          <p>Load the bundled <code>local-capture-extension</code> folder as an unpacked Chrome or Edge extension, then reload this app. The paste and XML import options remain available without it.</p>
        </div>
      )}

      <div className="messages-capture-footer">
        <small>Password, OTPs, QR codes, and Google session data never enter MoMo Statement. You can stop safely and run a fresh scan again.</small>
        {isRunning ? (
          <button className="btn btn-danger" type="button" onClick={capture.stopCapture}>Stop capture</button>
        ) : (
          <button className="btn btn-primary" type="button" disabled={!canStart} onClick={() => capture.startCapture(providers)}>
            <Icon name="download" size={16} /> {capture.status === 'completed' ? 'Run capture again' : 'Start local capture'}
          </button>
        )}
      </div>

      <details className="messages-capture-help">
        <summary>How this works on a phone</summary>
        <p>Google Messages Web is the desktop view of the Messages app. Pair it in Google’s own page using your account or phone, then return here and start the local capture. Mobile browsers that cannot install the helper should use the existing paste or XML upload fallback.</p>
      </details>
    </section>
  );
}

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagesWebCapture from '../../components/messages/MessagesWebCapture';
import { Icon } from '../../components/ui/Icon';
import { parseMessages, parseSmsBackupXml } from '../../lib/parser/engine';
import { previewTransactions, useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

const TABS = [
  { id: 'paste', label: 'Paste messages', icon: 'document' },
  { id: 'upload', label: 'Upload file', icon: 'upload' },
  { id: 'web', label: 'Messages Web', icon: 'external' },
];

function countPossibleMessages(text, isXml = false) {
  if (isXml) return (text.match(/<sms\b/gi) || []).length;
  return text.split(/\n\s*\n|---+|===+/).filter((block) => block.trim()).reduce((total, block) => {
    const messageStarts = block.match(/(?:^|\n)\s*(?=(?:Payment|Cash In|You have|Withdrawal|Airtime))/gi)?.length || 0;
    return total + Math.max(1, messageStarts);
  }, 0);
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Not reported';
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

function formatPreviewDate(transaction) {
  const value = transaction.timestamp ?? transaction.date;
  if (!value) return 'Date unavailable';
  if (transaction.timestampIsInferred) return 'Date inferred';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-GH');
}

function getReviewReasons(transaction, isAmbiguous) {
  const reasons = [];
  if (isAmbiguous) reasons.push('Similar payment already exists');
  if (transaction.timestampIsInferred || !(transaction.timestamp ?? transaction.date)) reasons.push('Date is inferred or unavailable');
  if (transaction.balance === null || transaction.balance === undefined) reasons.push('Balance not reported');
  if (!transaction.counterpartyName || transaction.counterpartyName === 'Unknown counterparty') reasons.push('Counterparty not identified');
  if (!(transaction.reference || transaction.txnId)) reasons.push('No reference or transaction ID');
  return reasons;
}

function StatusMessage({ result }) {
  if (!result) return null;
  const isError = result.type === 'error';
  return (
    <div className={`import-status ${isError ? 'error' : ''}`} role={isError ? 'alert' : 'status'}>
      <Icon name={isError ? 'alert' : 'checkCircle'} size={19} />
      <div>
        <strong>{result.title}</strong>
        <p>{result.message}</p>
      </div>
    </div>
  );
}

function ImportPreview({ preview, selectedIds, onToggle, onAdd, onDiscard }) {
  const selectedCount = preview.newTransactions.filter((transaction) => selectedIds.includes(transaction.id)).length;
  return (
    <section className="import-preview" aria-live="polite" aria-labelledby="import-preview-title">
      <div className="import-preview-heading">
        <div>
          <span className="eyebrow">Review before adding</span>
          <h3 id="import-preview-title">A local import is staged</h3>
          <p>Nothing in this preview is saved yet. Add only the new rows you want in the statement.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onDiscard}>Discard preview</button>
      </div>
      <div className="import-preview-counts">
        <div><span>New records</span><strong>{preview.newTransactions.length}</strong></div>
        <div><span>Duplicates</span><strong>{preview.duplicateCount}</strong></div>
        <div><span>Unsupported (est.)</span><strong>{preview.unsupportedCount}</strong></div>
        <div><span>Needs review</span><strong>{preview.needsReviewCount}</strong></div>
      </div>
      <div className="import-preview-list">
        {preview.newTransactions.map((transaction) => {
          const isSelected = selectedIds.includes(transaction.id);
          const reasons = getReviewReasons(transaction, preview.ambiguousTransactionIds.includes(transaction.id));
          return (
            <article className={`import-preview-row ${isSelected ? 'selected' : ''}`} key={transaction.id}>
              <label className="import-preview-select">
                <input type="checkbox" checked={isSelected} onChange={() => onToggle(transaction.id)} />
                <span className="import-preview-row-copy">
                  <strong>{transaction.counterpartyName || 'Unknown counterparty'}</strong>
                  <span>{transaction.provider} · {transaction.type} · {formatPreviewDate(transaction)}</span>
                </span>
                <strong className={`import-preview-amount ${isCredit(transaction.type) ? 'credit' : 'debit'}`}>
                  {isCredit(transaction.type) ? '+' : '−'}{formatMoney(transaction.amount)}
                </strong>
              </label>
              <div className="import-preview-row-meta">
                <span className={reasons.length ? 'needs-review' : 'ready-review'}>{reasons.length ? reasons.join(' · ') : 'Ready to review'}</span>
                <details>
                  <summary>View source</summary>
                  <pre>{transaction.rawBody || 'Source text was not supplied.'}</pre>
                </details>
              </div>
            </article>
          );
        })}
      </div>
      <div className="import-preview-footer">
        <small>{preview.parsedCount} supported transaction{preview.parsedCount === 1 ? '' : 's'} parsed from about {preview.sourceCount} source message{preview.sourceCount === 1 ? '' : 's'}. Unsupported count is an estimate until the source format is recognized.</small>
        <button className="btn btn-primary" type="button" disabled={!selectedCount} onClick={onAdd}>
          <Icon name="checkCircle" size={17} /> Add {selectedCount} selected record{selectedCount === 1 ? '' : 's'}
        </button>
      </div>
    </section>
  );
}

export default function ImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('paste');
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [result, setResult] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [selectedImportIds, setSelectedImportIds] = useState([]);
  const addTransactions = useTxnStore((state) => state.addTransactions);
  const transactions = useTxnStore((state) => state.transactions);
  const transactionCount = useTxnStore((state) => state.transactions.length);
  const addToast = useUIStore((state) => state.addToast);

  const parseText = (sourceText, source = 'paste', isXml = false) => {
    const parsed = isXml ? parseSmsBackupXml(sourceText, source) : parseMessages(sourceText, source);
    if (!parsed.length) {
      setPendingImport(null);
      setSelectedImportIds([]);
      const sourceCount = countPossibleMessages(sourceText, isXml);
      setResult({
        type: 'error',
        title: 'No supported transactions found',
        message: `The parser checked about ${sourceCount} source message${sourceCount === 1 ? '' : 's'} but found no supported Ghana Mobile Money transaction.`,
      });
      return;
    }

    const { newTransactions, duplicateCount, ambiguousCount, ambiguousTransactionIds } = previewTransactions(transactions, parsed);
    const sourceCount = Math.max(countPossibleMessages(sourceText, isXml), parsed.length);
    const unsupportedCount = Math.max(0, sourceCount - parsed.length);
    const basicReviewIds = newTransactions.filter((transaction) => (
      transaction.timestampIsInferred
      || transaction.balance === null
      || !transaction.counterpartyName
      || transaction.counterpartyName === 'Unknown counterparty'
      || !(transaction.reference || transaction.txnId)
    )).map((transaction) => transaction.id);
    const needsReviewCount = new Set([...basicReviewIds, ...ambiguousTransactionIds]).size;
    setPendingImport({
      newTransactions,
      duplicateCount,
      ambiguousCount,
      ambiguousTransactionIds,
      unsupportedCount,
      needsReviewCount,
      parsedCount: parsed.length,
      sourceCount,
    });
    setSelectedImportIds(newTransactions.map((transaction) => transaction.id));
    setResult({
      type: 'success',
      title: `${newTransactions.length} new transaction${newTransactions.length === 1 ? '' : 's'} ready for review`,
      message: 'Inspect the import counts below, then explicitly add the new rows to your local statement.',
    });
  };

  const commitImport = () => {
    const selectedTransactions = pendingImport?.newTransactions.filter((transaction) => selectedImportIds.includes(transaction.id)) || [];
    if (!selectedTransactions.length) {
      setResult({ type: 'success', title: 'Nothing new to add', message: 'Those supported rows already exist in this local statement.' });
      return;
    }
    const outcome = addTransactions(selectedTransactions);
    const addedCount = outcome?.addedCount ?? selectedTransactions.length;
    setPendingImport(null);
    setSelectedImportIds([]);
    if (!outcome?.persisted) {
      setResult({ type: 'error', title: `${addedCount} row${addedCount === 1 ? '' : 's'} added for this session`, message: 'The browser could not save them. Export a backup now and use the persistent retry notice above.' });
      addToast({ level: 'warning', message: `${addedCount} row${addedCount === 1 ? '' : 's'} added, but not saved in this browser.` });
      return;
    }
    setResult({ type: 'success', title: `${addedCount} transaction${addedCount === 1 ? '' : 's'} added`, message: 'The new rows are now in your local statement. Review them before exporting.' });
    addToast({ level: 'success', message: `${addedCount} transaction${addedCount === 1 ? '' : 's'} added to your statement.` });
  };

  const handleParse = () => {
    if (!text.trim()) {
      setResult({ type: 'error', title: 'Add a source first', message: 'Paste messages or choose a file to continue. The public sample is isolated on the home page.' });
      return;
    }
    parseText(text, activeTab === 'web' ? 'messages-web' : 'paste');
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsReadingFile(true);
    setResult(null);
    setPendingImport(null);
    setSelectedImportIds([]);
    try {
      setText(await file.text());
    } catch {
      setResult({ type: 'error', title: 'Could not read that file', message: 'Choose a plain text or SMS Backup & Restore XML file and try again.' });
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileParse = () => {
    if (!text.trim()) {
      setResult({ type: 'error', title: 'Choose a file first', message: 'Select a .txt or .xml file, then parse it here.' });
      return;
    }
    const isXml = selectedFile?.name.toLowerCase().endsWith('.xml') || selectedFile?.type === 'text/xml';
    parseText(text, 'upload', isXml);
  };

  const loadSample = () => {
    navigate('/');
    window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      document.getElementById('demo')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <div className="import-page">
      <div className="page-intro">
        <div>
          <h2>Start with your messages</h2>
          <p>Your first useful result takes one paste. The parser runs in this browser and keeps the raw source attached to each record.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={loadSample}>
          <Icon name="spark" size={17} />
          Try isolated sample
        </button>
      </div>

      <div className="import-layout">
        <section className="import-main">
          <div className="import-tabs" role="tablist" aria-label="Import source">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="import-panel"
                id={`import-tab-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setResult(null); setPendingImport(null); setSelectedImportIds([]); }}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="surface-card import-panel" id="import-panel" role="tabpanel" aria-labelledby={`import-tab-${activeTab}`}>
            {activeTab === 'upload' ? (
              <div className="import-compose">
                <div className="import-panel-header">
                  <div>
                    <h2>Upload a message archive</h2>
                  <p>Use an SMS Backup & Restore XML export or a plain text file. PDF import is not enabled yet.</p>
                  </div>
                  {selectedFile && <span className="badge badge-neutral">{selectedFile.name}</span>}
                </div>
                <div className="drop-zone">
                  <span className="drop-zone-icon"><Icon name="upload" size={26} /></span>
                  <h3>{selectedFile ? 'File ready to parse' : 'Choose your statement file'}</h3>
                  <p>{selectedFile ? `${text.length.toLocaleString()} characters loaded` : 'Plain text and SMS Backup & Restore XML are supported.'}</p>
                  <button className="btn btn-secondary" type="button" onClick={() => fileInputRef.current?.click()}>Browse files</button>
                  <input ref={fileInputRef} className="sr-only" type="file" accept=".txt,.xml,text/plain,text/xml" onChange={handleFile} />
                </div>
                <div className="import-compose-footer">
                  <small>{isReadingFile ? 'Reading file…' : 'Your file stays in this browser until you export or sync it.'}</small>
                  <button className="btn btn-primary" type="button" disabled={isReadingFile} onClick={handleFileParse}>
                    <Icon name="activity" size={17} />
                    Parse file
                  </button>
                </div>
              </div>
            ) : (
              <div className="import-compose">
                {activeTab === 'web' && <MessagesWebCapture />}
                <div className="import-panel-header">
                  <div>
                    <h2>{activeTab === 'web' ? 'Keep paste as a fallback' : 'Paste your MoMo messages'}</h2>
                    <p>{activeTab === 'web' ? 'If the helper is unavailable, copy a Google Messages conversation and paste it below. The same local parser will review it.' : 'One or more messages is fine. Keep the original text so every result remains traceable.'}</p>
                  </div>
                </div>
                <label htmlFor="message-input" className="sr-only">MoMo message text</label>
                <textarea
                  id="message-input"
                  className="import-textarea"
                  value={text}
                  onChange={(event) => { setText(event.target.value); setResult(null); setPendingImport(null); setSelectedImportIds([]); }}
                  placeholder="Payment received for GHS 250.00 from KWEKU MENSAH..."
                  spellCheck="false"
                />
                <div className="import-compose-footer">
                  <small>{text.length.toLocaleString()} characters · about {countPossibleMessages(text)} message{countPossibleMessages(text) === 1 ? '' : 's'}</small>
                  <div className="import-actions">
                    <button className="btn btn-ghost" type="button" onClick={() => { setText(''); setResult(null); setPendingImport(null); setSelectedImportIds([]); }}>Clear</button>
                    <button className="btn btn-primary" type="button" onClick={handleParse}>
                      <Icon name="activity" size={17} />
                      Parse messages
                    </button>
                  </div>
                </div>
              </div>
            )}
            <StatusMessage result={result} />
            {pendingImport && <ImportPreview
              preview={pendingImport}
              selectedIds={selectedImportIds}
              onToggle={(id) => setSelectedImportIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
              onAdd={commitImport}
              onDiscard={() => { setPendingImport(null); setSelectedImportIds([]); }}
            />}
          </div>

          {transactionCount > 0 && (
            <div className="import-next-step">
              <div>
                <strong>Your statement is taking shape</strong>
                <span>{transactionCount} records are ready for review.</span>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/app/statement')}>
                Review statement <Icon name="arrowRight" size={16} />
              </button>
            </div>
          )}
        </section>

        <aside className="import-side" aria-label="Import guidance">
          <div className="surface-card import-side-card">
            <h3>Supported networks</h3>
            <p>Provider-specific parsing keeps the output readable and reviewable.</p>
            <div className="provider-list">
              <div className="provider-item"><span className="provider-dot mtn" /> MTN Mobile Money</div>
              <div className="provider-item"><span className="provider-dot telecel" /> Telecel Cash</div>
              <div className="provider-item"><span className="provider-dot airteltigo" /> AirtelTigo Money</div>
            </div>
          </div>
          <div className="surface-card import-side-card">
            <div className="privacy-note">
              <Icon name="lock" size={18} />
              <span><strong>Local-first by default.</strong><br />Nothing leaves this device until you choose a connected action.</span>
            </div>
          </div>
          <div className="surface-card import-side-card">
            <h3>What happens next?</h3>
            <p>Review parsed rows, check balances and fees, then export a clean statement or proof-of-income summary.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

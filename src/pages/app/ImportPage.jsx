import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagesWebCapture from '../../components/messages/MessagesWebCapture';
import { Icon } from '../../components/ui/Icon';
import { parseMessages, parseSmsBackupXml } from '../../lib/parser/engine';
import { useTxnStore } from '../../stores/txnStore';
import { useUIStore } from '../../stores/uiStore';

const SAMPLE_MESSAGES = `Payment received for GHS 420.00 from KWEKU MENSAH (0241234567). Current Balance: GHS 1,850.50. Reference: Sales. Transaction ID: 18492048201.

Payment made for GHS 75.00 to MAX MART (0249876543). Current Balance: GHS 1,775.50. Reference: Groceries. Transaction ID: 18492059302. Fee charged: GHS 1.00 Tax charged: GHS 0.10.

Cash Out made for GHS 200.00 to KWEKU STORES (0240001112). Current Balance: GHS 1,573.50. Transaction ID: 18492089912. Fee charged: GHS 2.00.`;

const TABS = [
  { id: 'paste', label: 'Paste messages', icon: 'document' },
  { id: 'upload', label: 'Upload file', icon: 'upload' },
  { id: 'web', label: 'Messages Web', icon: 'external' },
];

function countPossibleMessages(text) {
  return text.split(/\n\s*\n|---+|===+/).filter((block) => block.trim()).length;
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

export default function ImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('paste');
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [result, setResult] = useState(null);
  const addTransactions = useTxnStore((state) => state.addTransactions);
  const transactionCount = useTxnStore((state) => state.transactions.length);
  const addToast = useUIStore((state) => state.addToast);

  const parseText = (sourceText, source = 'paste', isXml = false) => {
    const parsed = isXml ? parseSmsBackupXml(sourceText, source) : parseMessages(sourceText, source);
    if (!parsed.length) {
      setResult({
        type: 'error',
        title: 'No supported transactions found',
        message: 'Check that the text contains a Ghana Mobile Money message from MTN, Telecel, or AirtelTigo.',
      });
      return;
    }

    addTransactions(parsed);
    setResult({
      type: 'success',
      title: `${parsed.length} transaction${parsed.length === 1 ? '' : 's'} ready`,
      message: 'The parsed records are now in your local statement. Review them before exporting.',
    });
    addToast({ level: 'success', message: `${parsed.length} transaction${parsed.length === 1 ? '' : 's'} imported` });
  };

  const handleParse = () => {
    if (!text.trim()) {
      setResult({ type: 'error', title: 'Add a source first', message: 'Paste messages, upload a file, or load the sample to continue.' });
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
    setActiveTab('paste');
    setText(SAMPLE_MESSAGES);
    parseText(SAMPLE_MESSAGES, 'demo');
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
          Try sample data
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
                onClick={() => { setActiveTab(tab.id); setResult(null); }}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="surface-card import-panel">
            {activeTab === 'upload' ? (
              <div className="import-compose">
                <div className="import-panel-header">
                  <div>
                    <h2>Upload a message archive</h2>
                  <p>Use an SMS Backup & Restore XML export or a plain text file. PDF import is not enabled yet.</p>
                  </div>
                  {selectedFile && <span className="badge badge-neutral">{selectedFile.name}</span>}
                </div>
                <label className="drop-zone" tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && fileInputRef.current?.click()}>
                  <span className="drop-zone-icon"><Icon name="upload" size={26} /></span>
                  <h3>{selectedFile ? 'File ready to parse' : 'Choose your statement file'}</h3>
                  <p>{selectedFile ? `${text.length.toLocaleString()} characters loaded` : 'Plain text and SMS Backup & Restore XML are supported.'}</p>
                  <span className="btn btn-secondary">Browse files</span>
                  <input ref={fileInputRef} className="sr-only" type="file" accept=".txt,.xml,text/plain,text/xml" onChange={handleFile} />
                </label>
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
                  onChange={(event) => { setText(event.target.value); setResult(null); }}
                  placeholder="Payment received for GHS 250.00 from KWEKU MENSAH..."
                  spellCheck="false"
                />
                <div className="import-compose-footer">
                  <small>{text.length.toLocaleString()} characters · about {countPossibleMessages(text)} message{countPossibleMessages(text) === 1 ? '' : 's'}</small>
                  <div className="import-actions">
                    <button className="btn btn-ghost" type="button" onClick={() => { setText(''); setResult(null); }}>Clear</button>
                    <button className="btn btn-primary" type="button" onClick={handleParse}>
                      <Icon name="activity" size={17} />
                      Parse messages
                    </button>
                  </div>
                </div>
              </div>
            )}
            <StatusMessage result={result} />
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

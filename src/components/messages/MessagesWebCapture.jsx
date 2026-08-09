import React, { useState } from 'react';
import { Icon } from '../ui/Icon';
import { useMessagesWebCapture } from '../../hooks/useMessagesWebCapture';

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

export default function MessagesWebCapture() {
  const capture = useMessagesWebCapture();
  const [providers, setProviders] = useState(PROVIDERS.map(([code]) => code));
  const isRunning = ['starting', 'running', 'stopping'].includes(capture.status);
  const canStart = ['ready', 'completed'].includes(capture.status) && providers.length > 0;

  const toggleProvider = (code) => {
    setProviders((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  };

  return (
    <section className="messages-capture-card" aria-labelledby="messages-capture-title">
      <div className="messages-capture-header">
        <div>
          <span className="eyebrow"><Icon name="shield" size={14} /> Local browser capture</span>
          <h3 id="messages-capture-title">Load all relevant Messages Web conversations</h3>
          <p>Google keeps the sign-in and pairing step in its own tab. MoMo Statement receives only messages that match the supported Mobile Money parser.</p>
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
          <span>{capture.threads} conversations · {capture.inspected} messages checked · {capture.matched} relevant · {capture.imported} new rows</span>
        )}
      </div>

      {capture.status === 'unavailable' && (
        <div className="messages-capture-setup" role="note">
          <strong>One-time setup</strong>
          <p>Load the bundled <code>local-capture-extension</code> folder as an unpacked Chrome or Edge extension, then reload this app. The paste and XML import options remain available without it.</p>
        </div>
      )}

      <div className="messages-capture-footer">
        <small>Password, OTPs, QR codes, and Google session data never enter MoMo Statement.</small>
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

import React, { useMemo, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { parseMessages as parseStatementMessages } from '../../lib/parser/engine';

const SAMPLE_MESSAGES = `Payment received for GHS 420.00 from KWEKU MENSAH (0241234567). Current Balance: GHS 1,850.50. Reference: Sales. Transaction ID: 18492048201.

Payment made for GHS 75.00 to MAX MART (0249876543). Current Balance: GHS 1,775.50. Reference: Groceries. Transaction ID: 18492059302. Fee charged: GHS 1.00 Tax charged: GHS 0.10.

Cash Out made for GHS 200.00 to KWEKU STORES (0240001112). Current Balance: GHS 1,573.50. Transaction ID: 18492089912. Fee charged: GHS 2.00.`;

function formatMoney(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(value || 0);
}

function isCredit(type) {
  return ['RECEIVED', 'CASH_IN', 'Received'].includes(type);
}

const LiveDemo = () => {
  const [input, setInput] = useState(SAMPLE_MESSAGES);
  const [results, setResults] = useState(null);
  const parsedResults = useMemo(() => {
    if (!results?.transactions) return null;
    const totalIn = results.transactions.filter((txn) => isCredit(txn.type)).reduce((sum, txn) => sum + txn.amount, 0);
    const totalOut = results.transactions.filter((txn) => !isCredit(txn.type)).reduce((sum, txn) => sum + txn.amount, 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [results]);

  const parseInput = () => {
    const transactions = parseStatementMessages(input, 'demo');
    setResults(transactions.length ? { transactions } : { error: 'No supported transactions found in that sample.' });
  };

  return (
    <section id="demo" className="landing-section landing-section-muted">
      <div className="landing-shell">
        <div className="public-section-head">
          <span className="public-eyebrow">Try the real parser</span>
          <h2>See the first useful result before you sign in.</h2>
          <p>This demo uses the same parser engine as the workspace. Change the text, run it again, and inspect what the app can actually identify.</p>
        </div>

        <div className="demo-layout">
          <div className="demo-panel">
            <h3>Paste sample messages</h3>
            <p>Use one or more messages. The parser keeps the source attached to each result.</p>
            <label className="sr-only" htmlFor="landing-demo-input">Sample MoMo messages</label>
            <textarea id="landing-demo-input" className="demo-textarea" value={input} onChange={(event) => setInput(event.target.value)} spellCheck="false" />
            <div className="demo-panel-footer">
              <span className="demo-privacy-note"><Icon name="lock" size={15} /> Runs entirely in this browser</span>
              <button className="btn btn-primary" type="button" onClick={parseInput}>Parse messages <Icon name="arrowRight" size={16} /></button>
            </div>
          </div>

          <div className="demo-results" aria-live="polite">
            <h3>Parsed results</h3>
            <p>Reviewable outputs, not a decorative mockup.</p>
            {!results && <div className="demo-placeholder">Run the parser to see the provider, type, counterparty, and exact amount it found.</div>}
            {results?.error && <div className="demo-placeholder"><Icon name="alert" size={22} />{results.error}</div>}
            {results?.transactions && (
              <>
                <div className="demo-result-summary">
                  <div className="demo-stat"><span>Received</span><strong className="positive">{formatMoney(parsedResults.totalIn)}</strong></div>
                  <div className="demo-stat"><span>Sent</span><strong className="negative">{formatMoney(parsedResults.totalOut)}</strong></div>
                  <div className="demo-stat"><span>Net</span><strong>{formatMoney(parsedResults.net)}</strong></div>
                </div>
                <div className="demo-rows">
                  {results.transactions.map((txn) => {
                    const credit = isCredit(txn.type);
                    return (
                      <div className="demo-row" key={txn.id}>
                        <div className="demo-row-copy"><strong>{txn.counterpartyName || 'Unknown counterparty'}</strong><span>{txn.provider} · {txn.type}</span></div>
                        <strong className={`demo-row-amount ${credit ? 'positive' : 'negative'}`}>{credit ? '+' : '−'}{formatMoney(txn.amount)}</strong>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;

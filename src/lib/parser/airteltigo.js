/**
 * AirtelTigo Money (AT Money) Ghana SMS Parser Engine
 * Handles AirtelTigo Cash SMS messages
 */

export const AIRTELTIGO_SENDER_IDS = ['airteltigo', 'at', 'tigo', 'at money'];

function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+233')) clean = '0' + clean.slice(4);
  else if (clean.startsWith('233')) clean = '0' + clean.slice(3);
  return clean;
}

export function parseAirtelTigoMessage(body, timestamp = Date.now()) {
  if (!body || typeof body !== 'string') return null;

  const text = body.trim();
  let txn = {
    provider: 'AIRTELTIGO',
    rawBody: text,
    timestamp,
    fee: 0,
    tax: 0,
    currency: 'GHS'
  };

  // Pattern 1: Money Received
  // "You have received GHS 100.00 from YAW MENSAH 0277123456. Your new balance is GHS 400.00. TxnId: AT20260808001."
  const rxReceived = /received\s+GHS\s*([\d,]+\.\d{2})\s+from\s+([^\d\n]+?)(?:\s+(0\d{9}))?\.\s*Your new balance is\s+GHS\s*([\d,]+\.\d{2})/i;
  let match = text.match(rxReceived);
  if (match) {
    txn.type = 'RECEIVED';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const idMatch = text.match(/TxnId:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    return txn;
  }

  // Pattern 2: Money Sent
  // "You have sent GHS 80.00 to AMA BOATENG 0277654321. Fee: GHS 1.00. Balance: GHS 569.00. TxnId: AT20260808003."
  const rxSent = /sent\s+GHS\s*([\d,]+\.\d{2})\s+to\s+([^\d\n]+?)(?:\s+(0\d{9}))?\..*?Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxSent);
  if (match) {
    txn.type = 'SENT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const feeMatch = text.match(/Fee:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (feeMatch) txn.fee = parseFloat(feeMatch[1].replace(/,/g, ''));

    const idMatch = text.match(/TxnId:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    return txn;
  }

  return null;
}

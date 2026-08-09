/**
 * Telecel Cash Ghana SMS Parser Engine
 * Handles Telecel Cash (formerly Vodafone Cash) SMS messages
 */

export const TELECEL_SENDER_IDS = ['telecel', 'vodacash', 'vodafone', 'telecel cash'];

function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+233')) clean = '0' + clean.slice(4);
  else if (clean.startsWith('233')) clean = '0' + clean.slice(3);
  return clean;
}

export function parseTelecelMessage(body, timestamp = Date.now()) {
  if (!body || typeof body !== 'string') return null;

  const text = body.trim();
  let txn = {
    provider: 'TELECEL',
    rawBody: text,
    timestamp,
    fee: 0,
    tax: 0,
    currency: 'GHS'
  };

  // Pattern 1: Money Received
  // "You have received GHS 200.00 from ABENA OSEI (0202345678). Your balance is GHS 800.00. Reference: 1234567890."
  const rxReceived = /received\s+GHS\s*([\d,]+\.\d{2})\s+from\s+([^(\n]+?)(?:\s*\((0\d{9})\))?\.\s*Your balance is\s+GHS\s*([\d,]+\.\d{2})/i;
  let match = text.match(rxReceived);
  if (match) {
    txn.type = 'RECEIVED';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const refMatch = text.match(/Ref(?:erence)?:\s*([^.\n]+)/i);
    txn.txnId = refMatch ? refMatch[1].trim() : '';

    return txn;
  }

  // Pattern 2: Money Sent
  // "You have sent GHS 100.00 to KWEKU APPIAH (0207654321). Fee: GHS 1.00. Balance: GHS 699.00. Ref: TC20260808002."
  const rxSent = /sent\s+GHS\s*([\d,]+\.\d{2})\s+to\s+([^(\n]+?)(?:\s*\((0\d{9})\))?\..*?Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxSent);
  if (match) {
    txn.type = 'SENT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const feeMatch = text.match(/Fee:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (feeMatch) txn.fee = parseFloat(feeMatch[1].replace(/,/g, ''));

    const refMatch = text.match(/Ref:\s*([^.\n]+)/i);
    txn.txnId = refMatch ? refMatch[1].trim() : '';

    return txn;
  }

  // Pattern 3: Merchant Payment
  // "Payment of GHS 55.00 to MAX MART successful. Ref: TC20260808004. Balance: GHS 568.50."
  const rxMerchant = /Payment of\s+GHS\s*([\d,]+\.\d{2})\s+to\s+([^.\n]+?)\s+successful\.\s*Ref:\s*(\w+)\.\s*Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxMerchant);
  if (match) {
    txn.type = 'MERCHANT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.txnId = match[3];
    txn.balance = parseFloat(match[4].replace(/,/g, ''));
    return txn;
  }

  // Pattern 4: Airtime
  // "You bought GHS 10.00 airtime for 0201234567. Ref: TC20260808005. Balance: GHS 558.50."
  const rxAirtime = /bought\s+GHS\s*([\d,]+\.\d{2})\s+airtime.*?Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxAirtime);
  if (match) {
    txn.type = 'AIRTIME';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = 'Telecel Airtime';
    txn.balance = parseFloat(match[2].replace(/,/g, ''));

    const refMatch = text.match(/Ref:\s*(\w+)/i);
    txn.txnId = refMatch ? refMatch[1] : '';

    return txn;
  }

  return null;
}

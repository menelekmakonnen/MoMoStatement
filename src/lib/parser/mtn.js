/**
 * MTN MoMo Ghana SMS Parser Engine
 * Handles all Ghana MTN Mobile Money SMS variations
 */

export const MTN_SENDER_IDS = ['mobilemoney', 'mtn', 'mtn momo', 'mobile money', '170'];

/**
 * Normalizes phone numbers to standard 10-digit Ghana format (024XXXXXXX)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+233')) clean = '0' + clean.slice(4);
  else if (clean.startsWith('233')) clean = '0' + clean.slice(3);
  return clean;
}

/**
 * Parses a single MTN MoMo SMS message
 */
export function parseMtnMessage(body, timestamp = null) {
  if (!body || typeof body !== 'string') return null;

  const text = body.trim();
  let txn = {
    provider: 'MTN',
    rawBody: text,
    timestamp,
    fee: 0,
    tax: 0,
    currency: 'GHS'
  };

  // Pattern 1: Payment received / Cash In
  // "Payment received for GHS 250.00 from KOFFI MENSAH (0241234567). Current Balance: GHS 1,450.50. Reference: School fees. Transaction ID: 18492048201."
  // "Cash In received for GHS 500.00 from Agent KWEKU STORES (0240001112). Current Balance: GHS 1,594.50. Transaction ID: 18492095544."
  const rxReceived1 = /(?:Payment|Cash In)\s+received\s+for\s+GHS\s*([\d,]+\.\d{2})\s+from\s+([^(\n]+?)(?:\s*\((0\d{9})\))?\.\s*Current\s+Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  let match = text.match(rxReceived1);
  if (match) {
    txn.type = text.toLowerCase().includes('cash in') ? 'CASH_IN' : 'RECEIVED';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const refMatch = text.match(/Reference:\s*([^.\n]+)/i);
    txn.reference = refMatch ? refMatch[1].trim() : '';

    const idMatch = text.match(/Transaction\s*ID:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    return txn;
  }

  // Pattern 2: You have received GHS X from Y
  // "You have received GHS 100.00 from ADWOA MENSAH. Your new balance is GHS 350.00. Transaction ID: 43921084. Fee Charged: GHS 0.00."
  const rxReceived2 = /You have received\s+GHS\s*([\d,]+\.\d{2})\s+from\s+([^.\n]+)\.\s*Your new balance is\s+GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxReceived2);
  if (match) {
    txn.type = 'RECEIVED';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.balance = parseFloat(match[3].replace(/,/g, ''));

    const idMatch = text.match(/Transaction\s*ID:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    const feeMatch = text.match(/Fee\s*Charged:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (feeMatch) txn.fee = parseFloat(feeMatch[1].replace(/,/g, ''));

    return txn;
  }

  // Pattern 3: Payment made / Transfer sent
  // "Payment made for GHS 100.00 to ADWOA MANSAH (0249876543). Current Balance: GHS 1,350.50. Reference: Groceries. Transaction ID: 18492059302. Fee charged: GHS 1.00 Tax charged: GHS 0.10."
  const rxSent1 = /Payment made for\s+GHS\s*([\d,]+\.\d{2})\s+to\s+([^(\n]+?)(?:\s*\((0\d{9})\))?\.\s*Current Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxSent1);
  if (match) {
    txn.type = 'SENT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const refMatch = text.match(/Reference:\s*([^.\n]+)/i);
    txn.reference = refMatch ? refMatch[1].trim() : '';

    const idMatch = text.match(/Transaction\s*ID:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    const feeMatch = text.match(/Fee charged:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (feeMatch) txn.fee = parseFloat(feeMatch[1].replace(/,/g, ''));

    const taxMatch = text.match(/Tax charged:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (taxMatch) txn.tax = parseFloat(taxMatch[1].replace(/,/g, ''));

    return txn;
  }

  // Pattern 4: Merchant Payment
  // "Payment of GHS 45.00 to SHOPRITE GHANA was successful. Financial Transaction Id: 18492066111. Current Balance: GHS 1,304.50. Reference: Inv 402."
  const rxMerchant = /Payment of\s+GHS\s*([\d,]+\.\d{2})\s+to\s+([^.\n]+?)\s+was successful\.\s*(?:Financial\s+)?Transaction\s*Id:\s*(\w+)\.\s*Current Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxMerchant);
  if (match) {
    txn.type = 'MERCHANT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.txnId = match[3];
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const refMatch = text.match(/Reference:\s*([^.\n]+)/i);
    txn.reference = refMatch ? refMatch[1].trim() : '';

    return txn;
  }

  // Pattern 5: Airtime Purchase
  // "You have successfully bought GHS 10.00 airtime for 0244112233. Balance: GHS 1,294.50. Trans ID: 18492078900."
  const rxAirtime = /(?:bought|purchase of)\s+GHS\s*([\d,]+\.\d{2})\s+airtime\s+(?:for\s+(0\d{9}))?.*?Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxAirtime);
  if (match) {
    txn.type = 'AIRTIME';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = 'MTN Airtime';
    txn.counterpartyPhone = normalizePhone(match[2]);
    txn.balance = parseFloat(match[3].replace(/,/g, ''));

    const idMatch = text.match(/Trans(?:action)?\s*ID:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    return txn;
  }

  // Pattern 6: Cash Out / Withdrawal
  // "Cash Out made for GHS 200.00 to Agent KWEKU STORES (0240001112). Current Balance: GHS 1,094.50. Transaction ID: 18492089912. Fee charged: GHS 2.00."
  const rxCashOut = /(?:Cash Out made|Withdrawal of)\s+(?:for\s+)?GHS\s*([\d,]+\.\d{2})\s+(?:to|at)\s+([^(\n]+?)(?:\s*\((0\d{9})\))?\.\s*Current Balance:\s*GHS\s*([\d,]+\.\d{2})/i;
  match = text.match(rxCashOut);
  if (match) {
    txn.type = 'CASH_OUT';
    txn.amount = parseFloat(match[1].replace(/,/g, ''));
    txn.counterpartyName = match[2].trim();
    txn.counterpartyPhone = normalizePhone(match[3]);
    txn.balance = parseFloat(match[4].replace(/,/g, ''));

    const idMatch = text.match(/Transaction\s*ID:\s*(\w+)/i);
    txn.txnId = idMatch ? idMatch[1] : '';

    const feeMatch = text.match(/Fee charged:\s*GHS\s*([\d,]+\.\d{2})/i);
    if (feeMatch) txn.fee = parseFloat(feeMatch[1].replace(/,/g, ''));

    return txn;
  }

  return null;
}

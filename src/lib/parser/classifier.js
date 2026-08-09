/**
 * Transaction Classifier & Intelligence Engine
 * Categorizes MoMo transactions and detects business vs personal spending
 */

const BUSINESS_KEYWORDS = [
  'LTD', 'LIMITED', 'ENTERPRISE', 'VENTURES', 'STORES', 'SHOP', 'MART',
  'PHARMACY', 'HOTEL', 'RESTAURANT', 'MARKET', 'FILLING STATION', 'GAS',
  'SCHOOL', 'UNIVERSITY', 'HOSPITAL', 'CLINIC', 'SUPERMARKET', 'MALL',
  'AUTO', 'SERVICES', 'GLOBAL', 'GHANA', 'LOGISTICS', 'HARDWARE'
];

export function classifyTransaction(txn) {
  if (!txn) return null;

  let category = 'expense';
  let isBusinessRelated = false;

  // Determine category
  if (['RECEIVED', 'CASH_IN'].includes(txn.type)) {
    category = 'income';
  } else if (txn.type === 'AIRTIME') {
    category = 'utility';
  } else if (txn.type === 'MERCHANT') {
    category = 'expense';
    isBusinessRelated = true;
  } else if (txn.type === 'SENT') {
    // Check if counterparty looks like business
    const nameUpper = (txn.counterpartyName || '').toUpperCase();
    if (BUSINESS_KEYWORDS.some(kw => nameUpper.includes(kw))) {
      isBusinessRelated = true;
      category = 'expense';
    } else if (txn.amount % 100 === 0 && txn.amount >= 500) {
      category = 'transfer';
    } else {
      category = 'expense';
    }
  }

  return {
    ...txn,
    category,
    isBusinessRelated,
    id: txn.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'txn_' + Math.random().toString(36).substr(2, 9))
  };
}

export function detectUnusual(transactions = []) {
  if (!transactions.length) return [];
  const flagged = [];

  const avgAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0) / transactions.length;

  transactions.forEach(txn => {
    // Large amount flag (> 3x average)
    if (txn.amount > avgAmount * 3 && txn.amount > 300) {
      flagged.push({
        transaction: txn,
        reason: `Unusually large transaction (GHS ${txn.amount.toFixed(2)} is 3x higher than your average)`
      });
    }

    // Midnight transaction (12am - 5am)
    if (txn.timestamp && !txn.timestampIsInferred) {
      const hour = new Date(txn.timestamp).getHours();
      if (hour >= 0 && hour <= 4) {
        flagged.push({
          transaction: txn,
          reason: 'Late night transaction between 12:00 AM and 5:00 AM'
        });
      }
    }
  });

  return flagged;
}

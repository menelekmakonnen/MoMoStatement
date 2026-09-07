import { create } from 'zustand';

const STORAGE_KEY = 'momo_transactions_v1';

let storageReadFailed = false;

export const EMPTY_FILTERS = Object.freeze({
  startDate: null,
  endDate: null,
  provider: 'All',
  type: 'All',
  category: 'All',
  search: '',
});

function getCounterparty(txn) {
  return String(txn.counterpartyName || txn.counterparty || 'Unknown counterparty');
}

function getTransactionDate(txn) {
  return txn.timestamp ?? txn.date ?? null;
}

function getSimilarityKey(txn) {
  if (txn.txnId) return null;
  return [
    String(txn.provider || 'unknown').trim().toLowerCase(),
    String(txn.type || '').trim().toLowerCase(),
    getCounterparty(txn).trim().toLowerCase(),
    String(txn.reference || '').trim().toLowerCase(),
    txn.amount,
  ].join('|');
}

export function getTransactionKey(txn) {
  const provider = String(txn.provider || 'unknown').trim().toLowerCase();
  const transactionId = String(txn.txnId || '').trim().toLowerCase();
  if (transactionId) return `${provider}|transaction-id|${transactionId}`;
  return null;
}

function normalizeTransaction(txn) {
  return {
    ...txn,
    id: txn.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `txn-${Date.now()}`),
    counterpartyName: getCounterparty(txn),
    timestamp: getTransactionDate(txn),
    amount: Number(txn.amount) || 0,
    balance: txn.balance === null || txn.balance === undefined || txn.balance === '' ? null : Number(txn.balance),
    fee: Number(txn.fee) || 0,
    tax: Number(txn.tax) || 0,
  };
}

function readStoredTransactions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) throw new Error('Stored transaction data is not an array.');
    storageReadFailed = false;
    return stored.map(normalizeTransaction);
  } catch {
    storageReadFailed = true;
    return [];
  }
}

function persistTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    // A full or unavailable browser store must not blank the active workspace.
    return false;
  }
}

export function previewTransactions(existingTransactions = [], incomingTransactions = []) {
  const existingKeys = new Set(existingTransactions
    .map(getTransactionKey)
    .filter(Boolean));
  const existingSimilarKeys = new Set(existingTransactions.map(getSimilarityKey).filter(Boolean));
  const newTransactions = [];
  const ambiguousTransactionIds = [];
  const newSimilarKeys = new Set();
  let duplicateCount = 0;

  incomingTransactions.map(normalizeTransaction).forEach((txn) => {
    const key = getTransactionKey(txn);
    const identified = Boolean(txn.txnId);
    if (identified && existingKeys.has(key)) {
      duplicateCount += 1;
      return;
    }
    if (identified) existingKeys.add(key);
    const similarityKey = getSimilarityKey(txn);
    if (similarityKey && (existingSimilarKeys.has(similarityKey) || newSimilarKeys.has(similarityKey))) {
      ambiguousTransactionIds.push(txn.id);
    }
    if (similarityKey) newSimilarKeys.add(similarityKey);
    newTransactions.push(txn);
  });

  return {
    newTransactions,
    duplicateCount,
    ambiguousCount: ambiguousTransactionIds.length,
    ambiguousTransactionIds,
  };
}

const initialTransactions = readStoredTransactions();

export function filterTransactions(transactions = [], filters = EMPTY_FILTERS) {
  const activeFilters = { ...EMPTY_FILTERS, ...filters };
  const search = String(activeFilters.search || '').trim().toLowerCase();
  const startDate = activeFilters.startDate ? new Date(`${activeFilters.startDate}T00:00:00`) : null;
  const endDate = activeFilters.endDate ? new Date(`${activeFilters.endDate}T23:59:59`) : null;

  return transactions.filter((txn) => {
    if (activeFilters.provider !== 'All' && txn.provider !== activeFilters.provider) return false;
    if (activeFilters.type !== 'All' && txn.type !== activeFilters.type) return false;
    if (activeFilters.category !== 'All' && txn.category !== activeFilters.category) return false;

    if (startDate || endDate) {
      const transactionDateValue = getTransactionDate(txn);
      const transactionDate = transactionDateValue === null ? Number.NaN : new Date(transactionDateValue).getTime();
      if (!Number.isFinite(transactionDate)) return false;
      if (startDate && transactionDate < startDate.getTime()) return false;
      if (endDate && transactionDate > endDate.getTime()) return false;
    }

    if (search) {
      const haystack = [
        getCounterparty(txn),
        txn.reference,
        txn.txnId,
        txn.counterpartyPhone,
        txn.rawBody,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function getTransactionStats(transactions = [], filters = EMPTY_FILTERS) {
  return filterTransactions(transactions, filters).reduce((acc, txn) => {
    const isCredit = ['RECEIVED', 'CASH_IN', 'Received'].includes(txn.type);
    if (isCredit) {
      acc.totalIn += txn.amount;
    } else {
      acc.totalOut += txn.amount;
    }
    acc.feeTotal += txn.fee || 0;
    acc.count += 1;
    acc.net = acc.totalIn - acc.totalOut;
    return acc;
  }, { totalIn: 0, totalOut: 0, net: 0, feeTotal: 0, count: 0 });
}

export const useTxnStore = create((set, get) => ({
  transactions: initialTransactions,
  storageError: storageReadFailed,
  storageReadError: storageReadFailed,
  filters: { ...EMPTY_FILTERS },
  
  setTransactions: (transactions) => {
    const state = get();
    const normalized = transactions.map(normalizeTransaction);
    if (state.storageReadError) {
      set({ transactions: normalized, storageError: true });
      return { persisted: false, blockedByReadError: true };
    }
    const persisted = persistTransactions(normalized);
    set({ transactions: normalized, storageError: !persisted, storageReadError: false });
    return { persisted, blockedByReadError: false };
  },
  addTransactions: (newTxns = []) => {
    const state = get();
    const preview = previewTransactions(state.transactions, newTxns);
    const transactions = [...preview.newTransactions, ...state.transactions];
    const persisted = preview.newTransactions.length
      ? (state.storageReadError ? false : persistTransactions(transactions))
      : !state.storageError;
    set({ transactions, storageError: state.storageReadError || !persisted, storageReadError: state.storageReadError });
    return { ...preview, addedCount: preview.newTransactions.length, persisted };
  },
  retryPersistence: () => {
    const state = get();
    if (state.storageReadError) {
      const refreshed = readStoredTransactions();
      if (storageReadFailed) {
        set({ storageError: true, storageReadError: true });
        return { persisted: false, reloaded: false, blockedByReadError: true };
      }
      const recovered = previewTransactions(refreshed, state.transactions).newTransactions;
      const reconciled = [...recovered, ...refreshed];
      const persisted = persistTransactions(reconciled);
      set({ transactions: reconciled, storageError: !persisted, storageReadError: false });
      return { persisted, reloaded: true, reconciledCount: recovered.length, blockedByReadError: false };
    }
    const persisted = persistTransactions(get().transactions);
    set({ storageError: !persisted, storageReadError: false });
    return { persisted, reloaded: false, blockedByReadError: false };
  },
  clearTransactions: () => {
    let persisted = true;
    try { localStorage.removeItem(STORAGE_KEY); } catch { persisted = false; }
    set({ transactions: [], storageError: !persisted, storageReadError: false });
    return { persisted };
  },
  
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  resetFilters: () => set({
    filters: { ...EMPTY_FILTERS },
  }),
  
  getFilteredTransactions: () => filterTransactions(get().transactions, get().filters),
  getStats: () => getTransactionStats(get().transactions, get().filters),
}));

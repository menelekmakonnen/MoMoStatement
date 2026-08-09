import { create } from 'zustand';

const STORAGE_KEY = 'momo_transactions_v1';

export const EMPTY_FILTERS = Object.freeze({
  startDate: null,
  endDate: null,
  provider: 'All',
  type: 'All',
  category: 'All',
  search: '',
});

function getCounterparty(txn) {
  return txn.counterpartyName || txn.counterparty || 'Unknown counterparty';
}

function getTransactionDate(txn) {
  return txn.timestamp || txn.date || Date.now();
}

function getTransactionKey(txn) {
  return [
    txn.provider || 'unknown',
    txn.txnId || txn.reference || txn.rawBody || '',
    getCounterparty(txn),
    txn.amount,
    getTransactionDate(txn),
  ].join('|');
}

function normalizeTransaction(txn) {
  return {
    ...txn,
    id: txn.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `txn-${Date.now()}`),
    counterpartyName: getCounterparty(txn),
    timestamp: getTransactionDate(txn),
    amount: Number(txn.amount) || 0,
    balance: Number(txn.balance) || 0,
    fee: Number(txn.fee) || 0,
    tax: Number(txn.tax) || 0,
  };
}

function readStoredTransactions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.map(normalizeTransaction) : [];
  } catch {
    return [];
  }
}

function persistTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // A full or unavailable browser store must not blank the active workspace.
  }
}

export function filterTransactions(transactions = [], filters = EMPTY_FILTERS) {
  const activeFilters = { ...EMPTY_FILTERS, ...filters };
  const search = String(activeFilters.search || '').trim().toLowerCase();
  const startDate = activeFilters.startDate ? new Date(`${activeFilters.startDate}T00:00:00`) : null;
  const endDate = activeFilters.endDate ? new Date(`${activeFilters.endDate}T23:59:59`) : null;

  return transactions.filter((txn) => {
    if (activeFilters.provider !== 'All' && txn.provider !== activeFilters.provider) return false;
    if (activeFilters.type !== 'All' && txn.type !== activeFilters.type) return false;
    if (activeFilters.category !== 'All' && txn.category !== activeFilters.category) return false;

    const transactionDate = new Date(getTransactionDate(txn));
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;

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
  transactions: readStoredTransactions(),
  filters: { ...EMPTY_FILTERS },
  
  setTransactions: (transactions) => {
    const normalized = transactions.map(normalizeTransaction);
    persistTransactions(normalized);
    set({ transactions: normalized });
  },
  addTransactions: (newTxns) => set((state) => {
    const existingKeys = new Set(state.transactions.map(getTransactionKey));
    const incoming = newTxns
      .map(normalizeTransaction)
      .filter((txn) => {
        const key = getTransactionKey(txn);
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
      });
    const transactions = [...incoming, ...state.transactions];
    persistTransactions(transactions);
    return { transactions };
  }),
  clearTransactions: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* safe storage */ }
    set({ transactions: [] });
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

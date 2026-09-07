import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTransactions, getTransactionKey, getTransactionStats, previewTransactions } from '../src/stores/txnStore.js';

const transactions = [
  {
    id: 'received-1',
    provider: 'MTN',
    type: 'RECEIVED',
    category: 'income',
    counterpartyName: 'Kweku Mensah',
    counterpartyPhone: '0241234567',
    reference: 'Sales',
    timestamp: '2026-08-01T10:00:00',
    amount: 420,
    fee: 0,
  },
  {
    id: 'sent-1',
    provider: 'MTN',
    type: 'MERCHANT',
    category: 'expense',
    counterpartyName: 'Max Mart',
    reference: 'Groceries',
    timestamp: '2026-08-02T10:00:00',
    amount: 75,
    fee: 1,
  },
];

test('filters use the same fields shown in the statement search', () => {
  assert.equal(filterTransactions(transactions, { search: '0241234567' }).length, 1);
  assert.equal(filterTransactions(transactions, { provider: 'MTN', type: 'MERCHANT' })[0].reference, 'Groceries');
  assert.equal(filterTransactions(transactions, { startDate: '2026-08-02', endDate: '2026-08-02' }).length, 1);
});

test('stats are derived from the visible records and calculate net flow', () => {
  assert.deepEqual(getTransactionStats(transactions), {
    totalIn: 420,
    totalOut: 75,
    net: 345,
    feeTotal: 1,
    count: 2,
  });
});

test('import previews deduplicate a transaction ID even when the source timestamp changes', () => {
  const existing = [{ provider: 'MTN', txnId: 'TX-100', timestamp: '2026-08-01T10:00:00', amount: 25 }];
  const incoming = [
    { provider: 'MTN', txnId: 'TX-100', timestamp: '2026-08-02T10:00:00', amount: 25 },
    { provider: 'MTN', txnId: 'TX-101', timestamp: null, amount: 30 },
  ];

  const preview = previewTransactions(existing, incoming);

  assert.equal(preview.duplicateCount, 1);
  assert.equal(preview.newTransactions.length, 1);
  assert.equal(preview.newTransactions[0].txnId, 'TX-101');
});

test('import previews keep no-ID payments on different dates and flag similar rows', () => {
  const existing = [{ provider: 'MTN', type: 'SENT', counterpartyName: 'Landlord', reference: 'Rent', timestamp: '2026-08-01', amount: 500 }];
  const incoming = [{ provider: 'MTN', type: 'SENT', counterpartyName: 'Landlord', reference: 'Rent', timestamp: '2026-09-01', amount: 500 }];

  const preview = previewTransactions(existing, incoming);

  assert.equal(preview.duplicateCount, 0);
  assert.equal(preview.newTransactions.length, 1);
  assert.equal(preview.ambiguousCount, 1);
});

test('no-ID source matches remain selectable instead of being auto-discarded', () => {
  const existing = [{ provider: 'MTN', type: 'SENT', counterpartyName: 'Landlord', reference: 'Rent', timestamp: '2026-08-01', amount: 500, rawBody: 'same source' }];
  const incoming = [{ provider: 'MTN', type: 'SENT', counterpartyName: 'Landlord', reference: 'Rent', timestamp: '2026-08-01', amount: 500, rawBody: 'same source' }];

  const preview = previewTransactions(existing, incoming);

  assert.equal(getTransactionKey(incoming[0]), null);
  assert.equal(preview.duplicateCount, 0);
  assert.equal(preview.newTransactions.length, 1);
  assert.equal(preview.ambiguousCount, 1);
});

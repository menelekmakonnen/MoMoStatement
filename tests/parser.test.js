import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMessages, parseSingleMessage } from '../src/lib/parser/engine.js';

const SAMPLE_MESSAGES = `Payment received for GHS 420.00 from KWEKU MENSAH (0241234567). Current Balance: GHS 1,850.50. Reference: Sales. Transaction ID: 18492048201.

Payment made for GHS 75.00 to MAX MART (0249876543). Current Balance: GHS 1,775.50. Reference: Groceries. Transaction ID: 18492059302. Fee charged: GHS 1.00 Tax charged: GHS 0.10.

Cash Out made for GHS 200.00 to KWEKU STORES (0240001112). Current Balance: GHS 1,573.50. Transaction ID: 18492089912. Fee charged: GHS 2.00.`;

test('sample messages produce reviewable parsed transactions', () => {
  const parsed = parseMessages(SAMPLE_MESSAGES, 'test-fixture');

  assert.equal(parsed.length, 3);
  assert.deepEqual(parsed.map((transaction) => transaction.type), ['RECEIVED', 'SENT', 'CASH_OUT']);
  assert.equal(parsed.every((transaction) => transaction.source === 'test-fixture'), true);
  assert.equal(parsed.every((transaction) => transaction.rawBody), true);
  assert.equal(parsed.every((transaction) => transaction.timestamp === null), true);
  assert.equal(parsed.every((transaction) => transaction.timestampIsInferred), true);
});

test('Telecel payments are not rejected because a counterparty contains a promo substring', () => {
  const parsed = parseSingleMessage(
    'You have sent GHS 100.00 to KWEKU APPIAH (0207654321). Fee: GHS 1.00. Balance: GHS 699.00. Ref: TC20260808002.',
    'Telecel',
    1780000000000,
    'test-fixture',
  );

  assert.equal(parsed?.provider, 'TELECEL');
  assert.equal(parsed?.type, 'SENT');
  assert.equal(parsed?.counterpartyName, 'KWEKU APPIAH');
});

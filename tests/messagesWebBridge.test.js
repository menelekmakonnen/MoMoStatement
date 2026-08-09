import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CAPTURE_BATCH_SIZE,
  MAX_CAPTURE_TEXT_LENGTH,
  MESSAGES_BRIDGE_VERSION,
  normalizeCaptureBatch,
} from '../src/lib/messagesWebBridge.js';

test('capture bridge keeps only bounded non-empty message candidates', () => {
  const batch = normalizeCaptureBatch([
    { body: '  GHS 100.00 received  ', sender: 'MTN', timestamp: '1720000000000', conversationId: 'abc' },
    { body: '', sender: 'ignored' },
    { body: 'x'.repeat(MAX_CAPTURE_TEXT_LENGTH + 20), sender: 'long' },
  ]);

  assert.equal(batch.length, 2);
  assert.equal(batch[0].body, 'GHS 100.00 received');
  assert.equal(batch[0].timestamp, 1720000000000);
  assert.equal(batch[1].body.length, MAX_CAPTURE_TEXT_LENGTH);
});

test('capture bridge caps each batch before it reaches the parser', () => {
  const batch = normalizeCaptureBatch(Array.from({ length: MAX_CAPTURE_BATCH_SIZE + 8 }, (_, index) => ({ body: `message ${index}` })));
  assert.equal(batch.length, MAX_CAPTURE_BATCH_SIZE);
  assert.equal(MESSAGES_BRIDGE_VERSION, 1);
});

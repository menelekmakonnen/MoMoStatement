/**
 * Master SMS Parser Engine for Ghana Mobile Money
 * Combines MTN, Telecel, AirtelTigo parsers, promo filter, and classifier.
 */

import { parseMtnMessage, MTN_SENDER_IDS } from './mtn.js';
import { parseTelecelMessage, TELECEL_SENDER_IDS } from './telecel.js';
import { parseAirtelTigoMessage, AIRTELTIGO_SENDER_IDS } from './airteltigo.js';
import { isPromoMessage } from './filter.js';
import { classifyTransaction } from './classifier.js';

export const SUPPORTED_PROVIDERS = [
  { name: 'MTN Mobile Money', code: 'MTN', color: '#FFC000' },
  { name: 'Telecel Cash', code: 'TELECEL', color: '#E60000' },
  { name: 'AirtelTigo Money', code: 'AIRTELTIGO', color: '#00A0E1' }
];

export function parseSingleMessage(body, senderAddress = '', timestamp = null, source = 'paste') {
  if (!body || typeof body !== 'string') return null;

  const hasSourceTimestamp = timestamp !== null && timestamp !== undefined && Number.isFinite(Number(timestamp));
  const resolvedTimestamp = hasSourceTimestamp ? Number(timestamp) : null;

  // Filter promo messages
  if (isPromoMessage(body)) return null;

  const senderLower = (senderAddress || '').toLowerCase();
  let parsed = null;

  // 1. Detect by sender ID if present
  if (MTN_SENDER_IDS.some(id => senderLower.includes(id))) {
    parsed = parseMtnMessage(body, resolvedTimestamp);
  } else if (TELECEL_SENDER_IDS.some(id => senderLower.includes(id))) {
    parsed = parseTelecelMessage(body, resolvedTimestamp);
  } else if (AIRTELTIGO_SENDER_IDS.some(id => senderLower.includes(id))) {
    parsed = parseAirtelTigoMessage(body, resolvedTimestamp);
  }

  // 2. Fallback: try all provider parsers
  if (!parsed) parsed = parseMtnMessage(body, resolvedTimestamp);
  if (!parsed) parsed = parseTelecelMessage(body, resolvedTimestamp);
  if (!parsed) parsed = parseAirtelTigoMessage(body, resolvedTimestamp);

  if (!parsed) return null;

  parsed.source = source;
  parsed.timestampIsInferred = !hasSourceTimestamp;
  return classifyTransaction(parsed);
}

export function parseMessages(text, source = 'paste') {
  if (!text || typeof text !== 'string') return [];

  // Split text by blank lines or SMS delimiters
  const blocks = text.split(/\n\s*\n|---+|===+/);
  const transactions = [];

  blocks.forEach(block => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // Further split by single newlines if block contains multiple full messages
    const lines = trimmed.split('\n');
    let currentMsg = '';

    lines.forEach(line => {
      if (/Payment|Cash In|You have|Withdrawal|Airtime/i.test(line) && currentMsg.length > 30) {
        const result = parseSingleMessage(currentMsg, '', undefined, source);
        if (result) transactions.push(result);
        currentMsg = line;
      } else {
        currentMsg += (currentMsg ? ' ' : '') + line;
      }
    });

    if (currentMsg.length > 20) {
      const result = parseSingleMessage(currentMsg, '', undefined, source);
      if (result) transactions.push(result);
    }
  });

  return transactions;
}

export function parseSmsBackupXml(xmlString, source = 'upload') {
  if (!xmlString) return [];
  const transactions = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const smsNodes = xmlDoc.getElementsByTagName('sms');

    for (let i = 0; i < smsNodes.length; i++) {
      const node = smsNodes[i];
      const body = node.getAttribute('body');
      const address = node.getAttribute('address');
      const dateStr = node.getAttribute('date');
      const timestamp = dateStr ? parseInt(dateStr, 10) : undefined;

      const parsed = parseSingleMessage(body, address, timestamp, source);
      if (parsed) transactions.push(parsed);
    }
  } catch (err) {
    console.error('[MoMo Statement] [ERROR] [Parser] XML parsing error', err);
  }

  return transactions;
}

export const MESSAGES_APP_SOURCE = 'momo-statement-app';
export const MESSAGES_CAPTURE_SOURCE = 'momo-messages-capture';
export const MESSAGES_BRIDGE_VERSION = 1;
export const MAX_CAPTURE_BATCH_SIZE = 250;
export const MAX_CAPTURE_TEXT_LENGTH = 12000;

function safeString(value, maxLength = MAX_CAPTURE_TEXT_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function createCaptureSessionId() {
  const randomId = globalThis.crypto?.randomUUID?.();
  return randomId ? `momo-capture-${randomId}` : `momo-capture-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function postMessagesCaptureCommand(type, payload = {}) {
  if (typeof window === 'undefined') return;
  window.postMessage({
    source: MESSAGES_APP_SOURCE,
    version: MESSAGES_BRIDGE_VERSION,
    type,
    ...payload,
  }, '*');
}

export function isMessagesCaptureEvent(event) {
  return Boolean(
    typeof window !== 'undefined'
    && event?.source === window
    && event?.data?.source === MESSAGES_CAPTURE_SOURCE
    && event.data.version === MESSAGES_BRIDGE_VERSION
    && typeof event.data.type === 'string',
  );
}

export function normalizeCaptureBatch(batch) {
  if (!Array.isArray(batch)) return [];

  return batch.slice(0, MAX_CAPTURE_BATCH_SIZE).map((item) => ({
    body: safeString(item?.body),
    sender: safeString(item?.sender, 300),
    timestamp: Number.isFinite(Number(item?.timestamp)) ? Number(item.timestamp) : null,
    conversationId: safeString(item?.conversationId, 500),
    conversationName: safeString(item?.conversationName, 500),
  })).filter((item) => item.body);
}

export function listenForMessagesCapture(handler) {
  if (typeof window === 'undefined') return () => {};

  const listener = (event) => {
    if (!isMessagesCaptureEvent(event)) return;
    handler({
      ...event.data,
      batch: normalizeCaptureBatch(event.data.batch),
    });
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

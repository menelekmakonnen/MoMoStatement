(function connectMoMoApp() {
  const APP_SOURCE = 'momo-statement-app';
  const CAPTURE_SOURCE = 'momo-messages-capture';
  const VERSION = 1;
  const PAGE_COMMANDS = new Set(['bridge-ping', 'capture-start', 'capture-stop']);
  const BRIDGE_EVENTS = new Set([
    'bridge-ready',
    'google-state',
    'capture-started',
    'capture-progress',
    'capture-batch',
    'capture-completed',
    'capture-error',
    'capture-stopped',
  ]);

  function sendToBackground(type, payload = {}) {
    chrome.runtime.sendMessage({ type: `momo-${type}`, ...payload });
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== window.location.origin || event.data?.source !== APP_SOURCE || event.data.version !== VERSION) return;
    if (!PAGE_COMMANDS.has(event.data.type)) return;

    const { source, version, type, ...payload } = event.data;
    void source;
    void version;
    sendToBackground(type, payload);
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (!BRIDGE_EVENTS.has(message?.type)) return;
    window.postMessage({ source: CAPTURE_SOURCE, version: VERSION, ...message }, '*');
  });

  sendToBackground('app-ready');
})();

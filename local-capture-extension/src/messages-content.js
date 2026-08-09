(function connectGoogleMessages() {
  const EVENT_TYPES = new Set([
    'capture-started',
    'capture-progress',
    'capture-batch',
    'capture-completed',
    'capture-error',
    'capture-stopped',
  ]);
  let lastGoogleState = null;

  function sendToBackground(type, payload = {}) {
    chrome.runtime.sendMessage({ type: `momo-${type}`, ...payload });
  }

  function reportState() {
    const next = globalThis.MomoCaptureEngine?.detectState?.();
    if (!next || next.state === lastGoogleState) return;
    lastGoogleState = next.state;
    sendToBackground('google-state', { state: next.state });
  }

  function reportEngineEvent(type, payload = {}) {
    if (EVENT_TYPES.has(type)) sendToBackground(type, payload);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message?.type || !globalThis.MomoCaptureEngine) return;

    if (message.type === 'detect-state') {
      reportState();
      return;
    }

    if (message.type === 'capture-stop') {
      globalThis.MomoCaptureEngine.stop(message.sessionId);
      return;
    }

    if (message.type === 'capture-start') {
      reportState();
      globalThis.MomoCaptureEngine.start({
        sessionId: message.sessionId,
        providers: message.providers,
        emit: reportEngineEvent,
      });
    }
  });

  sendToBackground('messages-ready');
  window.setTimeout(reportState, 500);
  window.setTimeout(reportState, 1800);
  window.setInterval(reportState, 3000);
})();

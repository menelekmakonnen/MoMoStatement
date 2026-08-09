const state = {
  appTabId: null,
  googleTabId: null,
  googleState: 'unavailable',
  sessionId: null,
  pendingStart: null,
};

function sendToTab(tabId, message) {
  if (tabId === null || tabId === undefined) return;
  chrome.tabs.sendMessage(tabId, message, () => {
    // A tab may be navigating between the send and the callback. Reading the
    // error clears Chrome's lastError without surfacing a noisy console error.
    void chrome.runtime.lastError;
  });
}

function sendToApp(message) {
  sendToTab(state.appTabId, message);
}

function sendGoogleState(nextState, message = '') {
  state.googleState = nextState;
  sendToApp({ type: 'google-state', state: nextState, message });
}

function relayCapture(message, sender) {
  if (!sender.tab || sender.tab.id !== state.googleTabId) return;
  if (message.sessionId && state.sessionId && message.sessionId !== state.sessionId) return;
  sendToApp(message);
}

function startGoogleTab() {
  chrome.tabs.create({ url: 'https://messages.google.com/web/', active: true }, (tab) => {
    if (chrome.runtime.lastError || !tab?.id) {
      sendGoogleState('unavailable', 'The browser could not open Google Messages Web.');
      return;
    }
    state.googleTabId = tab.id;
    sendGoogleState('awaiting_pairing', 'Finish signing in or pairing in the Google Messages tab.');
  });
}

function forwardPendingStart() {
  if (!state.pendingStart || state.googleTabId === null || state.googleState !== 'paired') return;
  const pending = state.pendingStart;
  state.pendingStart = null;
  sendToTab(state.googleTabId, {
    type: 'capture-start',
    sessionId: pending.sessionId,
    providers: pending.providers,
  });
}

function requestCaptureStart(message, sender) {
  if (!sender.tab?.id) return;
  state.appTabId = sender.tab.id;
  state.sessionId = message.sessionId;
  state.pendingStart = {
    sessionId: message.sessionId,
    providers: Array.isArray(message.providers) ? message.providers.slice(0, 3) : [],
  };

  if (state.googleTabId === null) {
    startGoogleTab();
    return;
  }

  if (state.googleState === 'paired') {
    forwardPendingStart();
    return;
  }

  sendToTab(state.googleTabId, { type: 'detect-state' });
  sendToApp({
    type: 'google-state',
    state: state.googleState === 'needs_confirmation' ? 'needs_confirmation' : 'awaiting_pairing',
  });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message?.type) return;

  if (message.type === 'momo-app-ready' || message.type === 'momo-bridge-ping') {
    if (sender.tab?.id) state.appTabId = sender.tab.id;
    sendToApp({ type: 'bridge-ready' });
    sendToApp({ type: 'google-state', state: state.googleState });
    return;
  }

  if (message.type === 'momo-capture-start') {
    requestCaptureStart(message, sender);
    return;
  }

  if (message.type === 'momo-capture-stop') {
    if (sender.tab?.id === state.appTabId) {
      sendToTab(state.googleTabId, { type: 'capture-stop', sessionId: message.sessionId });
    }
    return;
  }

  if (message.type === 'momo-messages-ready') {
    if (sender.tab?.id) {
      state.googleTabId = sender.tab.id;
      sendToTab(state.googleTabId, { type: 'detect-state' });
    }
    return;
  }

  if (message.type === 'momo-google-state') {
    if (sender.tab?.id !== state.googleTabId) return;
    state.googleState = message.state || 'unavailable';
    sendToApp({ type: 'google-state', state: state.googleState });
    if (state.googleState === 'paired') forwardPendingStart();
    return;
  }

  if (message.type.startsWith('momo-capture-')) {
    relayCapture({ ...message, type: message.type.slice('momo-'.length) }, sender);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === state.googleTabId) {
    state.googleTabId = null;
    state.googleState = 'unavailable';
    state.pendingStart = null;
    sendGoogleState('unavailable', 'The Google Messages tab was closed.');
  }
  if (tabId === state.appTabId) {
    state.appTabId = null;
    state.sessionId = null;
    state.pendingStart = null;
  }
});

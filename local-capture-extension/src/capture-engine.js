(function createLocalCaptureEngine() {
  const MAX_CONVERSATION_ROUNDS = 120;
  const MAX_MESSAGE_SCROLL_ROUNDS = 300;
  const MAX_BATCH_SIZE = 100;
  const MAX_MESSAGE_LENGTH = 12000;
  const STOP_MESSAGE = 'Capture stopped by the user.';
  const TRANSACTION_MARKERS = /\b(?:payment|cash\s*(?:in|out)|cashout|cash-in|withdraw(?:al)?|deposit|airtime|bundle|received|sent|transfer|balance|fee|tax|reference|transaction)\b/i;
  const MONEY_MARKER = /(?:GHS|GH₵|GHC)\s*[\d,]+(?:\.\d{1,2})?|\b(?:amount|for)\s*[:=]?\s*\d[\d,.]*/i;
  const PROVIDER_RULES = {
    MTN: [/\bmtn\b/i, /mobile\s*money/i, /\bmomo\b/i, /(?:^|\D)170(?:\D|$)/i],
    TELECEL: [/\btelecel\b/i, /vodafone\s*cash/i, /\bvodacash\b/i],
    AIRTELTIGO: [/airtel\s*tigo/i, /\bairteltigo\b/i, /at\s*money/i, /\btigo\b/i],
  };
  let activeRun = null;

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  function textOf(value, maxLength = MAX_MESSAGE_LENGTH) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength) : '';
  }

  function isVisible(element) {
    if (!element || !(element instanceof Element)) return false;
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }

  function isTransactionText(value) {
    const text = textOf(value);
    return MONEY_MARKER.test(text) && TRANSACTION_MARKERS.test(text);
  }

  function matchesProvider(code, value) {
    return (PROVIDER_RULES[code] || []).some((pattern) => pattern.test(value || ''));
  }

  function matchesSelectedProvider(value, providers) {
    return providers.some((provider) => matchesProvider(provider, value));
  }

  function conversationList() {
    return document.querySelector('[role="listbox"]') || document.querySelector('.conv-container');
  }

  function conversationHref(row) {
    const anchor = row.matches?.('a[href]')
      ? row
      : row.querySelector?.('a[href*="/conversations/"]') || row.closest?.('a[href*="/conversations/"]');
    if (!anchor) return '';

    try {
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== 'https://messages.google.com' || !url.pathname.includes('/conversations/')) return '';
      return url.href;
    } catch {
      return '';
    }
  }

  function stableConversationId(href) {
    let hash = 0;
    for (let index = 0; index < href.length; index += 1) hash = ((hash << 5) - hash + href.charCodeAt(index)) | 0;
    return `conversation-${Math.abs(hash).toString(36)}`;
  }

  function readConversation(row) {
    const href = conversationHref(row);
    if (!href) return null;
    const name = textOf(row.querySelector?.('.profile-name, .name, h2, [class*="profile-name"], [class*="contact-name"]')?.innerText || '');
    const preview = textOf(row.querySelector?.('.snippet-text, [class*="snippet"], [class*="preview"]')?.innerText || '');
    return {
      href,
      id: stableConversationId(href),
      name: name || 'Messages conversation',
      preview,
    };
  }

  function getConversations() {
    const list = conversationList();
    if (!list) return { list: null, rows: [] };
    const optionRows = [...list.querySelectorAll('[role="option"]')];
    const anchors = optionRows.length ? optionRows : [...list.querySelectorAll('a[href*="/conversations/"]')];
    const unique = new Map();
    anchors.forEach((row) => {
      const item = readConversation(row);
      if (item && !unique.has(item.href)) unique.set(item.href, item);
    });
    return { list, rows: [...unique.values()] };
  }

  function findLoadMoreButton(list) {
    const buttons = [...(list?.querySelectorAll('button') || []), ...document.querySelectorAll('button.load-more')];
    return buttons.find((button) => {
      const label = `${button.innerText || ''} ${button.getAttribute('aria-label') || ''} ${button.className || ''}`;
      return isVisible(button) && !button.disabled && /load[- ]?more conversations|load[- ]?more/i.test(label);
    }) || null;
  }

  function dispatchScroll(element) {
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
  }

  function messageScrollContainer() {
    const candidates = [
      ...document.querySelectorAll('[class*="message"], [class*="conversation"], [role="main"], main, section, div'),
    ].filter((element) => {
      if (!isVisible(element) || element.matches('[role="listbox"], [role="option"]')) return false;
      const list = conversationList();
      if (list && (element === list || list.contains(element))) return false;
      return element.scrollHeight > element.clientHeight + 80 && element.clientHeight > 120;
    });
    candidates.sort((left, right) => (right.scrollHeight - right.clientHeight) - (left.scrollHeight - left.clientHeight));
    return candidates[0] || null;
  }

  function dialogState() {
    const dialogText = [...document.querySelectorAll('[role="dialog"], .cdk-overlay-pane, mat-dialog-container')]
      .map((element) => textOf(element.innerText, 3000))
      .join(' ');
    const useHereButton = [...document.querySelectorAll('button')]
      .some((button) => isVisible(button) && /^\s*Use here\s*$/i.test(textOf(button.innerText, 100)));
    return /Use Google Messages for web here\?/i.test(dialogText) || useHereButton ? 'needs_confirmation' : null;
  }

  function detectState() {
    if (dialogState()) return { state: 'needs_confirmation' };
    return conversationList() ? { state: 'paired' } : { state: 'awaiting_pairing' };
  }

  function checkStopped() {
    if (activeRun?.stopRequested) throw new Error(STOP_MESSAGE);
  }

  function candidateSelectors() {
    return [
      '[data-message-id]',
      'mws-message',
      '[role="listitem"]',
      '[class*="message-bubble"]',
      '[class*="message-content"]',
      '[class*="message-text"]',
      '[class*="message-body"]',
      '[class*="text-content"]',
    ].join(', ');
  }

  function readTimestamp(node) {
    const timeNode = node.querySelector?.('time[datetime], [data-timestamp], [data-message-timestamp], [data-time]');
    if (!timeNode) return null;
    const raw = timeNode.getAttribute('datetime')
      || timeNode.getAttribute('data-timestamp')
      || timeNode.getAttribute('data-message-timestamp')
      || timeNode.getAttribute('data-time');
    if (!raw) return null;
    const numeric = Number(raw);
    if (Number.isFinite(numeric)) return numeric < 100000000000 ? numeric * 1000 : numeric;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function readMessageBody(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll('button, [role="button"], svg, [aria-hidden="true"], [class*="action"], [class*="menu"]').forEach((element) => element.remove());
    return textOf(clone.innerText || clone.textContent || '');
  }

  function readMessageCandidate(node, conversationName) {
    const body = readMessageBody(node);
    if (body.length < 16 || body.length > MAX_MESSAGE_LENGTH) return null;
    const sender = textOf(node.querySelector?.('[data-sender], [class*="sender"], [class*="author"], cite')?.innerText || conversationName, 300);
    return {
      body,
      sender,
      timestamp: readTimestamp(node),
    };
  }

  function getMessageCandidates(conversationName) {
    const list = conversationList();
    const nodes = [...document.querySelectorAll(candidateSelectors())].filter((node) => {
      if (!isVisible(node)) return false;
      if (list && (node === list || list.contains(node) || node.closest?.('[role="listbox"]'))) return false;
      return true;
    });
    const unique = new Map();
    nodes.forEach((node) => {
      const candidate = readMessageCandidate(node, conversationName);
      if (!candidate) return;
      const key = `${candidate.sender}|${candidate.timestamp || ''}|${candidate.body}`;
      if (!unique.has(key)) unique.set(key, candidate);
    });
    return [...unique.values()];
  }

  async function loadAllConversations(emit) {
    const found = new Map();
    let quietRounds = 0;
    let previousSignature = '';

    for (let round = 0; round < MAX_CONVERSATION_ROUNDS; round += 1) {
      checkStopped();
      const current = getConversations();
      current.rows.forEach((row) => found.set(row.href, row));
      const signature = [...found.keys()].join('|');
      const beforeCount = found.size;
      let changed = signature !== previousSignature;
      const loadMore = findLoadMoreButton(current.list);

      if (loadMore) {
        loadMore.click();
        await wait(450);
        const afterClick = getConversations();
        afterClick.rows.forEach((row) => found.set(row.href, row));
        changed = changed || found.size > beforeCount;
      }

      const list = getConversations().list;
      if (list && list.scrollHeight > list.clientHeight + 80) {
        list.scrollTop = round % 2 === 0 ? list.scrollHeight : 0;
        dispatchScroll(list);
        await wait(350);
        const afterScroll = getConversations();
        afterScroll.rows.forEach((row) => found.set(row.href, row));
        changed = changed || found.size > beforeCount;
      }

      quietRounds = changed ? 0 : quietRounds + 1;
      previousSignature = [...found.keys()].join('|');
      emit('capture-progress', {
        message: loadMore ? 'Loading more Google Messages conversations…' : 'Checking all loaded conversations…',
        threads: found.size,
        inspected: 0,
        matched: 0,
      });

      if (!loadMore && quietRounds >= 4) break;
      if (loadMore && quietRounds >= 5) break;
    }
    return [...found.values()];
  }

  function selectedConversations(conversations, providers) {
    return conversations.filter((conversation) => {
      const context = `${conversation.name} ${conversation.preview}`;
      return matchesSelectedProvider(context, providers)
        || (/\b(?:momo|mobile\s*money)\b/i.test(context) && isTransactionText(context));
    });
  }

  async function openConversation(conversation) {
    checkStopped();
    if (window.location.href === conversation.href || window.location.pathname === new URL(conversation.href).pathname) return true;
    const anchor = [...document.querySelectorAll('a[href]')].find((candidate) => {
      try { return new URL(candidate.href, window.location.origin).href === conversation.href && isVisible(candidate); } catch { return false; }
    });
    if (!anchor) return false;
    anchor.click();
    return Boolean(await waitFor(() => window.location.pathname === new URL(conversation.href).pathname || messageScrollContainer(), 6000));
  }

  async function waitFor(predicate, timeout) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (predicate()) return true;
      await wait(180);
    }
    return false;
  }

  function collectVisibleMessages(conversation, providers, context, emit) {
    const candidates = getMessageCandidates(conversation.name);
    const batch = [];
    candidates.forEach((candidate) => {
      const key = `${candidate.sender}|${candidate.timestamp || ''}|${candidate.body}`;
      if (!context.inspected.has(key)) context.inspected.add(key);
      if (!isTransactionText(candidate.body)) return;
      if (!matchesSelectedProvider(`${conversation.name} ${candidate.sender} ${candidate.body}`, providers)) return;
      if (context.sent.has(key)) return;
      context.sent.add(key);
      batch.push({
        ...candidate,
        conversationId: conversation.id,
        conversationName: conversation.name,
      });
    });

    for (let index = 0; index < batch.length; index += MAX_BATCH_SIZE) {
      const chunk = batch.slice(index, index + MAX_BATCH_SIZE);
      context.matched += chunk.length;
      emit('capture-batch', {
        sessionId: context.sessionId,
        batch: chunk,
        inspected: context.inspected.size,
        matched: context.matched,
      });
    }
    return candidates.length;
  }

  async function captureConversation(conversation, providers, context, emit) {
    const container = messageScrollContainer();
    if (!container) {
      const candidateCount = collectVisibleMessages(conversation, providers, context, emit);
      if (!candidateCount) throw new Error('Google Messages message pane was not recognized; no messages were captured.');
      return;
    }
    const originalScrollTop = container.scrollTop;
    let nextScrollTop = container.scrollHeight;
    let quietAtTop = 0;

    for (let round = 0; round < MAX_MESSAGE_SCROLL_ROUNDS; round += 1) {
      checkStopped();
      const beforeHeight = container.scrollHeight;
      const beforeInspected = context.inspected.size;
      container.scrollTop = Math.max(0, nextScrollTop);
      dispatchScroll(container);
      await wait(400);

      const candidateCount = collectVisibleMessages(conversation, providers, context, emit);

      const atTop = container.scrollTop <= 2;
      const grew = container.scrollHeight > beforeHeight;
      const foundNew = context.inspected.size > beforeInspected || candidateCount > 0;
      if (atTop) {
        await wait(700);
        if (container.scrollHeight > beforeHeight) {
          quietAtTop = 0;
          nextScrollTop = 0;
          continue;
        }
        quietAtTop = grew || foundNew ? 0 : quietAtTop + 1;
        if (quietAtTop >= 3) break;
        nextScrollTop = 0;
      } else {
        quietAtTop = 0;
        const step = Math.max(220, Math.floor(container.clientHeight * 0.8));
        nextScrollTop = Math.max(0, container.scrollTop - step);
      }

      emit('capture-progress', {
        sessionId: context.sessionId,
        message: `Reading older messages locally (${context.inspected.size.toLocaleString()} checked)…`,
        inspected: context.inspected.size,
        matched: context.matched,
        threads: context.threads,
      });
    }

    container.scrollTop = originalScrollTop;
  }

  async function runCapture(config) {
    const providers = [...new Set((config.providers || []).filter((provider) => PROVIDER_RULES[provider]))];
    if (!providers.length) throw new Error('Choose at least one Mobile Money network.');
    const state = detectState();
    if (state.state !== 'paired') throw new Error(state.state === 'needs_confirmation' ? 'Confirm the Google Messages prompt before starting capture.' : 'Finish pairing Google Messages before starting capture.');

    config.emit('capture-started', { sessionId: config.sessionId });
    const conversations = await loadAllConversations(config.emit);
    const relevant = selectedConversations(conversations, providers);
    const context = {
      sessionId: config.sessionId,
      inspected: new Set(),
      sent: new Set(),
      matched: 0,
      threads: 0,
    };

    config.emit('capture-progress', {
      sessionId: config.sessionId,
      message: `Found ${relevant.length} supported Mobile Money conversation${relevant.length === 1 ? '' : 's'}.`,
      inspected: 0,
      matched: 0,
      threads: 0,
    });

    for (const conversation of relevant) {
      checkStopped();
      const opened = await openConversation(conversation);
      if (!opened) continue;
      context.threads += 1;
      await captureConversation(conversation, providers, context, config.emit);
      config.emit('capture-progress', {
        sessionId: config.sessionId,
        message: `Finished conversation ${context.threads} of ${relevant.length}.`,
        inspected: context.inspected.size,
        matched: context.matched,
        threads: context.threads,
      });
    }

    config.emit('capture-completed', {
      sessionId: config.sessionId,
      message: `Capture complete. ${context.matched} relevant message${context.matched === 1 ? '' : 's'} sent to the local parser.`,
      inspected: context.inspected.size,
      matched: context.matched,
      threads: context.threads,
    });
  }

  function start(config) {
    if (activeRun) return;
    activeRun = { sessionId: config.sessionId, stopRequested: false };
    runCapture(config)
      .catch((error) => {
        const stopped = error?.message === STOP_MESSAGE;
        config.emit(stopped ? 'capture-stopped' : 'capture-error', {
          sessionId: config.sessionId,
          message: error?.message || 'The local capture helper could not complete the scan.',
        });
      })
      .finally(() => { activeRun = null; });
  }

  function stop(sessionId) {
    if (activeRun && (!sessionId || activeRun.sessionId === sessionId)) activeRun.stopRequested = true;
  }

  globalThis.MomoCaptureEngine = { detectState, start, stop };
})();

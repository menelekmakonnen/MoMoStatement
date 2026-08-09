import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSingleMessage } from '../lib/parser/engine';
import {
  createCaptureSessionId,
  listenForMessagesCapture,
  postMessagesCaptureCommand,
} from '../lib/messagesWebBridge';
import { useTxnStore } from '../stores/txnStore';

const INITIAL_STATE = {
  status: 'checking',
  message: 'Looking for the local capture helper…',
  sessionId: null,
  inspected: 0,
  matched: 0,
  imported: 0,
  threads: 0,
  completedAt: null,
};

function parseCapturedItem(item) {
  const parsed = parseSingleMessage(item.body, item.sender, item.timestamp, 'messages-web');
  if (!parsed) return null;

  return {
    ...parsed,
    captureMethod: 'google-messages-web',
    captureConversationId: item.conversationId || undefined,
    captureConversationName: item.conversationName || undefined,
  };
}

export function useMessagesWebCapture() {
  const addTransactions = useTxnStore((state) => state.addTransactions);
  const sessionRef = useRef(null);
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const handleEvent = (event) => {
      if (event.type === 'bridge-ready') {
        setState((current) => ({ ...current, status: 'ready', message: 'Capture helper ready on this device.' }));
        return;
      }

      if (event.type === 'google-state') {
        const stateMap = {
          paired: ['ready', 'Google Messages is paired. Choose which supported networks to scan.'],
          awaiting_pairing: ['awaiting-google', 'Finish signing in or pairing in the Google Messages tab.'],
          needs_confirmation: ['needs-confirmation', 'Google Messages is asking which tab to use. Confirm that prompt in the Google tab.'],
          unavailable: ['awaiting-google', 'Open Google Messages Web and finish pairing before starting the scan.'],
        };
        const [status, message] = stateMap[event.state] || stateMap.unavailable;
        setState((current) => ({ ...current, status, message }));
        return;
      }

      if (event.type === 'capture-started') {
        sessionRef.current = event.sessionId;
        setState((current) => ({ ...current, status: 'running', sessionId: event.sessionId, message: 'Loading conversations and looking only for supported MoMo messages.' }));
        return;
      }

      if (event.sessionId && sessionRef.current && event.sessionId !== sessionRef.current) return;

      if (event.type === 'capture-progress') {
        setState((current) => ({
          ...current,
          status: 'running',
          message: event.message || current.message,
          inspected: Number(event.inspected) || current.inspected,
          matched: Number(event.matched) || current.matched,
          threads: Number(event.threads) || current.threads,
        }));
        return;
      }

      if (event.type === 'capture-batch') {
        const parsed = event.batch.map(parseCapturedItem).filter(Boolean);
        if (!parsed.length) return;

        const before = useTxnStore.getState().transactions.length;
        addTransactions(parsed);
        const after = useTxnStore.getState().transactions.length;
        setState((current) => ({
          ...current,
          status: 'running',
          imported: current.imported + Math.max(0, after - before),
          matched: Math.max(current.matched, Number(event.matched) || current.matched),
        }));
        return;
      }

      if (event.type === 'capture-completed') {
        setState((current) => ({
          ...current,
          status: 'completed',
          message: event.message || 'Capture complete. Review the imported rows before exporting.',
          inspected: Number(event.inspected) || current.inspected,
          matched: Number(event.matched) || current.matched,
          threads: Number(event.threads) || current.threads,
          completedAt: Date.now(),
        }));
        return;
      }

      if (event.type === 'capture-stopped') {
        setState((current) => ({
          ...current,
          status: 'completed',
          message: event.message || 'Capture stopped. Review any rows already imported.',
        }));
        return;
      }

      if (event.type === 'capture-error') {
        setState((current) => ({ ...current, status: 'error', message: event.message || 'The local capture helper stopped before completing.' }));
      }
    };

    const cleanup = listenForMessagesCapture(handleEvent);
    postMessagesCaptureCommand('bridge-ping');
    const retryTimer = window.setInterval(() => postMessagesCaptureCommand('bridge-ping'), 1500);
    const unavailableTimer = window.setTimeout(() => {
      setState((current) => current.status === 'checking'
        ? { ...current, status: 'unavailable', message: 'Install the optional local helper to automate Messages Web, or use paste/XML below.' }
        : current);
    }, 4500);
    return () => {
      cleanup();
      window.clearInterval(retryTimer);
      window.clearTimeout(unavailableTimer);
    };
  }, [addTransactions]);

  const openGoogleMessages = useCallback(() => {
    window.open('https://messages.google.com/web/', '_blank', 'noopener,noreferrer');
  }, []);

  const startCapture = useCallback((providers) => {
    const sessionId = createCaptureSessionId();
    sessionRef.current = sessionId;
    setState((current) => ({ ...INITIAL_STATE, ...current, status: 'starting', sessionId, message: 'Starting a local capture session…', inspected: 0, matched: 0, imported: 0, threads: 0 }));
    postMessagesCaptureCommand('capture-start', { sessionId, providers });
  }, []);

  const stopCapture = useCallback(() => {
    postMessagesCaptureCommand('capture-stop', { sessionId: sessionRef.current });
    setState((current) => ({ ...current, status: 'stopping', message: 'Stopping after the current local batch…' }));
  }, []);

  return { ...state, openGoogleMessages, startCapture, stopCapture };
}

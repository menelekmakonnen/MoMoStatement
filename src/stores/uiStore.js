import { create } from 'zustand';

const SIDEBAR_MIN_WIDTH = 224;
const SIDEBAR_MAX_WIDTH = 360;

function clampSidebarWidth(width) {
  const numericWidth = Number(width);
  if (!Number.isFinite(numericWidth)) return 260;
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, numericWidth));
}

function readNumber(key, fallback, { min, max } = {}) {
  try {
    const value = Number(localStorage.getItem(key));
    if (!Number.isFinite(value)) return fallback;
    if (Number.isFinite(min) && value < min) return min;
    if (Number.isFinite(max) && value > max) return max;
    return value;
  } catch {
    return fallback;
  }
}

function readBoolean(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

/**
 * UI Store — Theme, view state, modals, toasts
 * [LAW] One store per domain (§11.6)
 * [LAW] Selector subscriptions to avoid re-renders (§11.6)
 */
export const useUIStore = create((set, get) => ({
  /* ─── Theme ─── */
  theme: 'dark',
  setTheme: (theme) => {
    try {
      localStorage.setItem('momo_theme', theme);
    } catch { /* safe storage — never crash */ }
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  /* ─── Sidebar ─── */
  sidebarOpen: true,
  sidebarCollapsed: readBoolean('momo_sidebar_collapsed', false),
  sidebarWidth: readNumber('momo_sidebar_width', 260, { min: SIDEBAR_MIN_WIDTH, max: SIDEBAR_MAX_WIDTH }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => {
    const nextWidth = clampSidebarWidth(width);
    try {
      localStorage.setItem('momo_sidebar_width', String(nextWidth));
    } catch { /* safe */ }
    set({ sidebarWidth: nextWidth });
  },
  setSidebarCollapsed: (collapsed) => {
    try {
      localStorage.setItem('momo_sidebar_collapsed', String(collapsed));
    } catch { /* safe */ }
    set({ sidebarCollapsed: collapsed });
  },

  /* ─── Active View ─── */
  activeView: 'landing',
  setActiveView: (view) => set({ activeView: view }),

  /* ─── Modal ─── */
  modalStack: [],
  openModal: (modalId, props = {}) =>
    set((s) => ({ modalStack: [...s.modalStack, { id: modalId, props }] })),
  closeModal: () =>
    set((s) => ({ modalStack: s.modalStack.slice(0, -1) })),
  closeAllModals: () => set({ modalStack: [] }),

  /* ─── Toast System (§10.4) ─── */
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    const newToast = {
      id,
      level: toast.level || 'info',
      message: toast.message,
      duration: toast.duration || 5000,
      createdAt: Date.now(),
    };
    set((s) => ({ toasts: [...s.toasts, newToast] }));
    // Auto-dismiss
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, newToast.duration);
    return id;
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ─── Toast Helpers ─── */
  success: (message) => get().addToast({ level: 'success', message }),
  error: (message) => get().addToast({ level: 'error', message }),
  warning: (message) => get().addToast({ level: 'warning', message }),
  info: (message) => get().addToast({ level: 'info', message }),

  /* ─── Loading States (per-key) ─── */
  loadingStates: {},
  setLoading: (key, value) =>
    set((s) => ({ loadingStates: { ...s.loadingStates, [key]: value } })),
  isLoading: (key) => get().loadingStates[key] || false,
}));

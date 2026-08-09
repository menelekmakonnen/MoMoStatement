import { create } from 'zustand';

/**
 * Auth Store — User session, auth state
 * [LAW] One store per domain (§11.6)
 * [LAW] UUID tokens, server-revocable (§13.3)
 */
export const useAuthStore = create((set, get) => ({
  /* ─── State ─── */
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true until initial session check completes

  /* ─── Actions ─── */
  setUser: (user, token) => {
    try {
      if (token) localStorage.setItem('momo_token', token);
    } catch { /* safe */ }
    set({ user, token, isAuthenticated: !!user, isLoading: false });
  },

  clearUser: () => {
    try {
      localStorage.removeItem('momo_token');
    } catch { /* safe */ }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  /* ─── Computed ─── */
  hasRole: (minRole) => {
    const hierarchy = { user: 0, admin: 1, super_admin: 2, god_mode: 3 };
    const user = get().user;
    if (!user) return false;
    return (hierarchy[user.role] || 0) >= (hierarchy[minRole] || 0);
  },

  isGodMode: () => get().user?.role === 'god_mode',
  isSuperAdmin: () => get().hasRole('super_admin'),
  isAdmin: () => get().hasRole('admin'),

  /* ─── Session Restore ─── */
  restoreSession: async () => {
    try {
      const token = localStorage.getItem('momo_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // Will be wired to GAS backend in Phase 2
      // For now, just mark as not loading
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

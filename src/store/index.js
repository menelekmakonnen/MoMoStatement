import { create } from 'zustand';

// Assuming we want a centralized toast state
export const useUIStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, toast.duration || 3000);
    }
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));

// Mock auth store
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasRole: (minRole) => {
    const user = get().user;
    if (!user) return false;
    const roles = ['user', 'admin', 'super_admin', 'god_mode'];
    return roles.indexOf(user.role) >= roles.indexOf(minRole);
  }
}));

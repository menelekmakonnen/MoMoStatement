import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

export function useAuth() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const addToast = useUIStore((state) => state.addToast);

  const mockDelay = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

  const login = async (email, password) => {
    await mockDelay();
    if (email && password) {
      let role = 'user';
      if (email.includes('admin')) role = 'admin';
      if (email.includes('super')) role = 'super_admin';
      if (email.includes('god')) role = 'god_mode';
      
      authStore.setUser({ id: 1, name: 'Test User', email, role }, 'mock-token');
      addToast({ level: 'success', message: 'Successfully logged in' });
      return true;
    }
    throw new Error('Invalid credentials');
  };

  const loginWithPin = async (pin) => {
    await mockDelay();
    if (pin === '1234') {
      authStore.setUser({ id: 1, name: 'PIN User', email: 'pin@user.com', role: 'user' }, 'mock-token');
      addToast({ level: 'success', message: 'Logged in with PIN' });
      return true;
    }
    throw new Error('Invalid PIN');
  };

  const requestOtp = async () => {
    await mockDelay();
    addToast({ level: 'info', message: 'OTP sent to your email' });
    return true;
  };

  const verifyOtp = async (email, otp) => {
    await mockDelay();
    if (otp === '123456') {
      authStore.setUser({ id: 1, name: 'OTP User', email, role: 'user' }, 'mock-token');
      addToast({ level: 'success', message: 'OTP verified successfully' });
      return true;
    }
    throw new Error('Invalid OTP');
  };

  const register = async () => {
    await mockDelay();
    addToast({ level: 'success', message: 'Account created successfully' });
    return true;
  };

  const logout = () => {
    authStore.clearUser();
    addToast({ level: 'info', message: 'Logged out' });
    navigate('/');
  };

  return {
    ...authStore,
    login,
    loginWithPin,
    requestOtp,
    verifyOtp,
    register,
    logout,
  };
}

export function useRequireAuth() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);
}

export function useRequireRole(minRole) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasRole = useAuthStore((state) => state.hasRole);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasRole(minRole)) {
      addToast({ level: 'error', message: 'Insufficient permissions' });
      navigate('/app/import');
    }
  }, [addToast, hasRole, isAuthenticated, isLoading, minRole, navigate]);
}

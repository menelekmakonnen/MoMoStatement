import React from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../stores/uiStore';
import { Icon } from './Icon';

const ICON_NAMES = {
  success: 'checkCircle',
  error: 'close',
  warning: 'alert',
  info: 'activity',
};

export default function Toast() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const level = toast.level || 'info';
        const role = level === 'error' || level === 'warning' ? 'alert' : 'status';
        return (
          <div key={toast.id} className={`toast toast-${level}`} role={role}>
            <div className="toast-icon">
              <Icon name={ICON_NAMES[level] || ICON_NAMES.info} size={18} label={`${level} notification`} />
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              className="toast-close"
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}

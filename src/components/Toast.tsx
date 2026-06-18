import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span>{toast.message}</span>
          </div>
          <div className="toast-actions">
            {toast.actionHref && toast.actionLabel && (
              <Link to={toast.actionHref} className="toast-action-link" onClick={() => dismissToast(toast.id)}>
                {toast.actionLabel}
              </Link>
            )}
            <button type="button" className="toast-dismiss" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

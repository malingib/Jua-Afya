import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  closeButton?: boolean;
  backdrop?: boolean;
}

/**
 * Reusable Modal Component
 * Provides a consistent modal dialog for the application
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className = '',
  closeButton = true,
  backdrop = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      {backdrop && (
        <div
          className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 rounded-t-2xl">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

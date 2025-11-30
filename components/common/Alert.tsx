import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  closeable?: boolean;
  className?: string;
}

/**
 * Reusable Alert Component
 * Displays alert messages with different severity levels
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  closeable = true,
  className = '',
}) => {
  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-400',
      icon: Info,
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        p-4 rounded-lg border
        ${config.bg} ${config.border} ${config.text}
        flex gap-3
        ${className}
      `}
      role="alert"
    >
      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />

      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>

      {closeable && onClose && (
        <button
          onClick={onClose}
          className={`${config.text} hover:opacity-70 transition-opacity ml-2 flex-shrink-0`}
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;

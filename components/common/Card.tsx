import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * Reusable Card Component
 * Provides a consistent card layout for grouping content
 */
export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
  clickable = false,
  onClick,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        rounded-xl border border-slate-200 dark:border-slate-700
        ${hoverable ? 'hover:shadow-lg dark:hover:shadow-xl' : 'shadow'}
        ${clickable || onClick ? 'cursor-pointer' : ''}
        transition-all
        ${className}
      `}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {header && (
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          {header}
        </div>
      )}

      <div className="px-6 py-4">
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullHeight?: boolean;
}

/**
 * Reusable Loading Spinner Component
 * Displays a loading indicator with optional label
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  fullHeight = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const Container = fullHeight ? 'div' : 'div';
  const containerClass = fullHeight
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center gap-3';

  return (
    <Container className={containerClass}>
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 border-r-teal-500 animate-spin" />
        </div>
        {label && (
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </span>
        )}
      </div>
    </Container>
  );
};

export default LoadingSpinner;

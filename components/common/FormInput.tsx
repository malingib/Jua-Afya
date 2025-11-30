import React, { InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Reusable Form Input Component
 * Provides consistent styling and error handling for inputs
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      fullWidth = true,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg
              ${icon ? 'pl-10' : ''}
              ${hasError
                ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
              }
              ${disabled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                : 'text-slate-900 dark:text-white'
              }
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
              transition-all
              ${className}
            `}
            {...props}
          />
        </div>

        {(error || helper) && (
          <div
            className={`mt-2 text-sm flex items-start gap-2 ${
              error
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {error && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{error || helper}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;

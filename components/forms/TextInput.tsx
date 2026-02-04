import React, { forwardRef } from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, success, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const baseStyles = `
      w-full px-4 py-2.5 text-base rounded-lg border
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      transition-all duration-200
    `;

    const stateStyles = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    const paddingWithIcons = leftIcon && rightIcon
      ? 'pl-10 pr-10'
      : leftIcon
      ? 'pl-10'
      : rightIcon
      ? 'pr-10'
      : '';

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${paddingWithIcons} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

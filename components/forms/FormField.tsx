import React from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  htmlFor,
}) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-sm text-gray-500 flex items-start gap-1.5">
          <span className="text-blue-500 mt-0.5">ℹ️</span>
          <span>{hint}</span>
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1.5">
          <span className="mt-0.5">❌</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

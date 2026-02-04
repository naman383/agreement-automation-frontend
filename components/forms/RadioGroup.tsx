import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
            transition-all duration-200
            ${value === option.value
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={option.disabled}
            className="mt-0.5 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{option.label}</div>
            {option.description && (
              <div className="text-sm text-gray-500 mt-1">{option.description}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {current} of {total}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}% complete
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface StepIndicatorProps {
  steps: Array<{
    label: string;
    completed: boolean;
  }>;
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-sm font-semibold transition-all duration-200
                ${step.completed
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <span className={`text-xs mt-2 ${index === currentStep ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
              <div
                className={`h-full rounded transition-all duration-300 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

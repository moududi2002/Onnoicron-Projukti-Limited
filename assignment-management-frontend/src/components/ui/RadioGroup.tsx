// src/components/ui/RadioGroup.tsx
'use client';
import { clsx } from 'clsx';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  direction?: 'horizontal' | 'vertical';
}

export default function RadioGroup({
  options,
  value,
  onChange,
  label,
  error,
  direction = 'vertical',
}: RadioGroupProps) {
  return (
    <fieldset>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 mb-2">{label}</legend>
      )}
      <div className={clsx('space-y-2', direction === 'horizontal' && 'flex space-x-6 space-y-0')}>
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(
              'flex items-start cursor-pointer',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={option.disabled}
              className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <div className="ml-2">
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </fieldset>
  );
}
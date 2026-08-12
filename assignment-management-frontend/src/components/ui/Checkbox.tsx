// src/components/ui/Checkbox.tsx
'use client';
import { clsx } from 'clsx';

interface CheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  indeterminate?: boolean;
}

export default function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  error,
  indeterminate = false,
}: CheckboxProps) {
  return (
    <div>
      <label
        className={clsx(
          'flex items-start cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate;
          }}
          className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <div className="ml-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </label>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
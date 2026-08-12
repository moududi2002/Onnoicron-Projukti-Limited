'use client';

interface DateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string;
}

export default function DateTimePicker({ label, value, onChange, min, error }: DateTimePickerProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
      />
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </div>
  );
}
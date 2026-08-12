// components/ui/ProgressBar.tsx
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, max = 100, color = 'bg-primary-600', showLabel = false, size = 'sm' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const sizes = { sm: 'h-2', md: 'h-4' };

  return (
    <div>
      <div className={clsx('w-full bg-gray-200 rounded-full', sizes[size])}>
        <div
          className={clsx('rounded-full transition-all duration-300', color, sizes[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1">{value}/{max} ({Math.round(percentage)}%)</p>
      )}
    </div>
  );
}
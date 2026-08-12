// src/components/ui/Alert.tsx
import { clsx } from 'clsx';
import { HiX, HiCheckCircle, HiExclamation, HiInformationCircle } from 'react-icons/hi';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type = 'info', message, onClose }: AlertProps) {
  const styles = {
    success: { bg: 'bg-success-50 border-success-200', text: 'text-success-800', icon: HiCheckCircle },
    error: { bg: 'bg-danger-50 border-danger-200', text: 'text-danger-800', icon: HiExclamation },
    warning: { bg: 'bg-warning-50 border-warning-200', text: 'text-warning-800', icon: HiExclamation },
    info: { bg: 'bg-primary-50 border-primary-200', text: 'text-primary-800', icon: HiInformationCircle },
  };

  const { bg, text, icon: Icon } = styles[type];

  return (
    <div className={clsx('border rounded-lg p-4 flex items-start', bg)}>
      <Icon className={clsx('h-5 w-5 mt-0.5 flex-shrink-0', text)} />
      <p className={clsx('ml-3 text-sm flex-1', text)}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={clsx('ml-3 flex-shrink-0', text)}>
          <HiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

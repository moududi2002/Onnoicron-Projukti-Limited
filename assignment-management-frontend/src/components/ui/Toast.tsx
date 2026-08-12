// src/components/ui/Toast.tsx
'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { HiX, HiCheckCircle, HiExclamation, HiInformationCircle } from 'react-icons/hi';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: { bg: 'bg-success-500', icon: HiCheckCircle },
    error: { bg: 'bg-danger-500', icon: HiExclamation },
    warning: { bg: 'bg-warning-500', icon: HiExclamation },
    info: { bg: 'bg-primary-500', icon: HiInformationCircle },
  };

  const { bg, icon: Icon } = styles[type];

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300',
        bg,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
      <p className="text-sm mr-4">{message}</p>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="flex-shrink-0 hover:opacity-80">
        <HiX className="h-4 w-4" />
      </button>
    </div>
  );
}
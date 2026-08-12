'use client';

import { useState, useEffect } from 'react';

interface DeadlineCountdownProps {
  deadline: string;
  showDate?: boolean;
}

export default function DeadlineCountdown({ deadline, showDate = false }: DeadlineCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h remaining`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m remaining`);
      else setTimeLeft(`${minutes}m remaining`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isPassed = new Date(deadline) < new Date();

  return (
    <span className={`text-sm font-medium ${isPassed ? 'text-danger-600' : 'text-success-600'}`}>
      {showDate && <span className="text-gray-500 mr-1">{new Date(deadline).toLocaleDateString()}</span>}
      {timeLeft}
    </span>
  );
}
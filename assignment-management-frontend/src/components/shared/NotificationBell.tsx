 'use client';

import { useState } from 'react';
import { HiBell, HiX } from 'react-icons/hi';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Assignment', message: 'Math homework due tomorrow', time: '5m ago', read: false },
    { id: '2', title: 'Grade Posted', message: 'Your Science test has been graded', time: '1h ago', read: false },
    { id: '3', title: 'Deadline Reminder', message: 'English essay due in 2 days', time: '3h ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-500 hover:text-gray-700">
        <HiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-medium">Notifications</h3>
            <button onClick={() => setIsOpen(false)}><HiX className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-4 text-gray-500 text-sm">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-primary-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className={`h-2 w-2 mt-1.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
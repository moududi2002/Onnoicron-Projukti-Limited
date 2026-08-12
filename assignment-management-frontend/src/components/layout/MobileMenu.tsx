'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { navigation } from '@/config/navigation';
import { HiX, HiLogout, HiChevronRight } from 'react-icons/hi';
import { clsx } from 'clsx';
import { useState } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const userNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Menu Panel */}
      <div
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {userNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.href);

            return (
              <div key={item.href}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span className="flex items-center">
                      {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                      {item.label}
                    </span>
                    <HiChevronRight className={clsx('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      'flex items-center px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                    {item.label}
                  </Link>
                )}

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-8 border-l border-gray-200">
                    {item.children
                      ?.filter((child) => child.roles.includes(user?.role || ''))
                      .map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'text-primary-700 font-medium'
                              : 'text-gray-600 hover:text-gray-900'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={() => { logout(); onClose(); }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <HiLogout className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
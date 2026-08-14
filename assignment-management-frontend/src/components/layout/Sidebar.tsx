// src/components/layout/Sidebar.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { navigation } from '@/config/navigation';
import { HiX, HiLogout,HiUser } from 'react-icons/hi';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const userNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    
    <div
      className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center space-x-2">
          <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-lg font-bold text-gray-900">AMS</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
          <HiX className="h-6 w-6" />
        </button>
      </div>

      {/* User Info */}

      <div className="px-6 py-4 border-b border-gray-200">
        <Link 
          href={`/${user?.role?.toLowerCase()}/profile`}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors group"
        >
          {user?.profilePicture ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-10 w-10 rounded-full object-cover border-2 border-primary-200 group-hover:border-primary-400 transition-colors"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 border-2 border-primary-200 group-hover:border-primary-400 flex items-center justify-center transition-colors">
              <span className="text-primary-600 font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <svg className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
 
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {userNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = isActive && hasChildren;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                <span className="flex-1">{item.label}</span>
              </Link>

              {/* Children */}
              {isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children
                    ?.filter((child) => child.roles.includes(user?.role || ''))
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          'flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors',
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
        <Link
        href={`/${user?.role.toLowerCase()}/profile`}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
      >
        <HiUser className="mr-3 h-5 w-5 flex-shrink-0" />
        My Profile
        </Link>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <HiLogout className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
    
  );
}
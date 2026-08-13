// src/app/(dashboard)/layout.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { navigation } from '@/config/navigation';
import { 
  HiMenu, HiX, HiBell, HiSearch, HiLogout, HiUser, HiCog 
} from 'react-icons/hi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

    const getDashboardPath = () => {
    switch (user?.role) {
      case 'Admin':
        return '/admin';
      case 'Teacher':
        return '/teacher';
      case 'Student':
        return '/student';
      default:
        return '/login';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <span className="ml-2 text-lg font-bold text-gray-900">AMS</span>
          </Link>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
         {/* {userNavigation.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
              {item.children && pathname.startsWith(item.href) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children
                    .filter(child => child.roles.includes(user?.role || ''))
                    .map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          pathname === child.href
                            ? 'text-primary-700 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          ))} 
          */}


          {userNavigation.map((item) => {
            const itemHref =
            item.label === 'Dashboard'
              ? getDashboardPath()
              : item.label === 'Assignments'
                ? user?.role === 'Student'
                  ? '/student/assignments'
                  : '/teacher/assignments'
                : item.href;


            const isActive =
              pathname === itemHref ||
              (item.label !== 'Dashboard' && pathname.startsWith(itemHref + '/'));

            return (
              <div key={item.label}>
                <Link
                  href={itemHref}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>

                {item.children && pathname.startsWith(itemHref) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children
                      .filter(child => child.roles.includes(user?.role || ''))
                      .map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            pathname === child.href
                              ? 'text-primary-700 font-medium'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
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

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <HiLogout className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <HiMenu className="h-6 w-6" />
            </button>

            <div className="flex-1 flex justify-between items-center ml-4 lg:ml-0">
              {/* Search */}
              <div className="max-w-md w-full hidden sm:block">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="text-gray-500 hover:text-gray-700 relative"
                  >
                    <HiBell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
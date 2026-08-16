// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiMenu, HiBell, HiSearch, HiLogout, HiUser, HiCog, HiChevronDown,
} from 'react-icons/hi';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useRef } from 'react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    router.push('/login');
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'Admin': return '/admin/profile';
      case 'Teacher': return '/teacher/profile';
      case 'Student': return '/student/profile';
      default: return '/profile';
    }
  };

  const getProfileImageUrl = (path?: string) => {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
  };


  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center space-x-4 flex-1">
          {onMenuClick && (
            <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700">
              <HiMenu className="h-6 w-6" />
            </button>
          )}
          <div className="max-w-md w-full hidden sm:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications 
          <button className="relative text-gray-500 hover:text-gray-700">
            <HiBell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button> */}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 focus:outline-none hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              {/* Profile Picture / Avatar */}
              {user?.profilePicture ? (
                <img
                  src={getProfileImageUrl(user.profilePicture)}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-9 w-9 rounded-full object-cover border-2 border-primary-200"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 leading-tight">{user?.role}</p>
              </div>
              <HiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {user?.profilePicture ? (
                      <img
                        src={getProfileImageUrl(user.profilePicture)}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-lg">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href={getProfileRoute()}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HiUser className="mr-3 h-5 w-5 text-gray-400" />
                    View Profile
                  </Link>

                 <Link
                    href={`${getProfileRoute()}/edit`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HiCog className="mr-3 h-5 w-5 text-gray-400" />
                    Edit Profile
                  </Link>
                  

                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <HiLogout className="mr-3 h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
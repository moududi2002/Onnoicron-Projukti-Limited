// src/components/layout/AuthLayout.tsx

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="flex min-h-screen">
        {/* Left Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
          <div className="max-w-md text-center text-white">
            <Link href="/" className="inline-block mb-8">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold mb-4">Assignment Management</h1>
            <p className="text-lg text-primary-100">
              Streamline your educational workflow with our comprehensive assignment management platform.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-600 text-center mb-8">{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
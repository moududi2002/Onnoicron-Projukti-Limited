// src/app/(dashboard)/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { DashboardStats } from '@/types';
import { HiClipboardList, HiCheckCircle, HiClock, HiChartBar } from 'react-icons/hi';

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<DashboardStats>('/dashboard/student')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Assignments', value: stats?.totalAssignments || 0, icon: HiClipboardList, color: 'bg-primary-500' },
    { label: 'Submitted', value: stats?.totalSubmissions || 0, icon: HiCheckCircle, color: 'bg-success-500' },
    { label: 'Pending', value: stats?.pendingGrading || 0, icon: HiClock, color: 'bg-warning-500' },
    { label: 'Average Grade', value: `${stats?.averageGrade || 0}%`, icon: HiChartBar, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/student/assignments" className="block w-full px-4 py-2 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              View Assignments
            </Link>
            <Link href="/student/submissions" className="block w-full px-4 py-2 text-center border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
              My Submissions
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start space-x-3 text-sm">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">{a.description}</p>
                    <p className="text-gray-500 text-xs">{a.timeAgo || a.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}
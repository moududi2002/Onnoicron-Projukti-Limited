// src/app/(dashboard)/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { DashboardStats } from '@/types';
import { 
  HiUsers, HiAcademicCap, HiBookOpen, HiClipboardList, 
  HiDocumentText, HiCheckCircle, HiClock, HiUserGroup 
} from 'react-icons/hi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await apiClient.get<DashboardStats>('/dashboard/admin');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: HiUsers, color: 'bg-primary-500', href: '/admin/users' },
    { name: 'Total Students', value: stats?.totalStudents || 0, icon: HiUsers, color: 'bg-success-500', href: '/admin/users' },
    { name: 'Total Teachers', value: stats?.totalTeachers || 0, icon: HiAcademicCap, color: 'bg-warning-500', href: '/admin/users' },
    { name: 'Total Classes', value: stats?.totalClasses || 0, icon: HiBookOpen, color: 'bg-danger-500', href: '/admin/classes' },
    { name: 'Total Subjects', value: stats?.totalSubjects || 0, icon: HiBookOpen, color: 'bg-indigo-500', href: '/admin/subjects' },
    { name: 'All Assignments', value: stats?.totalAssignments || 0, icon: HiClipboardList, color: 'bg-purple-500', href: '/admin/assignments' },
    { name: 'All Submissions', value: stats?.totalSubmissions || 0, icon: HiDocumentText, color: 'bg-cyan-500', href: '/admin/submissions' },
    { name: 'Pending Grading', value: stats?.pendingGrading || 0, icon: HiClock, color: 'bg-orange-500', href: '/admin/submissions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your assignment management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.href} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/assign-teacher" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <HiUserGroup className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Assign Teachers</h3>
              <p className="text-sm text-gray-500">Assign teachers to subjects & classes</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/assignments" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <HiClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">View All Assignments</h3>
              <p className="text-sm text-gray-500">Monitor all assignments</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/submissions" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <HiDocumentText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">View All Submissions</h3>
              <p className="text-sm text-gray-500">Monitor all submissions</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <HiUsers className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.userName} • {activity.timeAgo || activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}
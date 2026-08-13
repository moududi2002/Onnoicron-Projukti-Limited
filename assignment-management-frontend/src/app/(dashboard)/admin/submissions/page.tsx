'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';
import { Submission, PaginatedResponse } from '@/types';
import { HiEye, HiSearch } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('searchTerm', searchTerm);

      const data = await apiClient.get<PaginatedResponse<Submission>>(`/submission?${params}`);
      setSubmissions(data.data);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded': return 'bg-success-100 text-success-800';
      case 'Submitted': return 'bg-primary-100 text-primary-800';
      case 'LateSubmitted': return 'bg-warning-100 text-warning-800';
      case 'Rejected': return 'bg-danger-100 text-danger-800';
      case 'Resubmitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Submissions</h1>
        <p className="mt-1 text-sm text-gray-600">View and monitor all submissions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student or assignment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Search</button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="LateSubmitted">Late Submitted</option>
          <option value="Graded">Graded</option>
          <option value="Rejected">Rejected</option>
          <option value="Resubmitted">Resubmitted</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">Loading...</td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No submissions found</td></tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{s.assignmentTitle}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      {s.marks !== undefined && s.marks !== null ? `${s.marks}/${s.maximumMarks}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/submissions/${s.id}`} className="text-primary-600 hover:text-primary-900">
                        <HiEye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
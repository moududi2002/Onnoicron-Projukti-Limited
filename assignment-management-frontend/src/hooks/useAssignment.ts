'use client';

import { useState, useEffect, useCallback } from 'react';
import { assignmentService } from '@/services/assignment-service';
import { Assignment, PaginatedResponse } from '@/types';

export function useAssignment(assignmentId?: string) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getById(assignmentId);
      setAssignment(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { assignment, loading, error, refetch: fetch };
}

export function useAssignments(filters?: Record<string, any>) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await assignmentService.getAll({ ...filters, page: pagination.page, limit: pagination.limit });
      setAssignments(data.data);
      setPagination((prev) => ({ ...prev, total: data.total, totalPages: data.totalPages }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { assignments, loading, pagination, setPage: (page: number) => setPagination((p) => ({ ...p, page })), refetch: fetch };
}
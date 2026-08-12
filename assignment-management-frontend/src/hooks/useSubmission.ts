'use client';

import { useState, useEffect, useCallback } from 'react';
import { submissionService } from '@/services/submission-service';
import { Submission } from '@/types';

export function useSubmission(submissionId?: string) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const data = await submissionService.getById(submissionId);
      setSubmission(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { submission, loading, refetch: fetch };
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await submissionService.getMySubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { submissions, loading, refetch: fetch };
}
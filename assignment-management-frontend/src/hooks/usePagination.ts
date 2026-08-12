'use client';

import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 10, total = 0 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const nextPage = useCallback(() => { if (hasNext) setPage((p) => p + 1); }, [hasNext]);
  const prevPage = useCallback(() => { if (hasPrev) setPage((p) => p - 1); }, [hasPrev]);
  const goToPage = useCallback((p: number) => { if (p >= 1 && p <= totalPages) setPage(p); }, [totalPages]);

  return { page, limit, totalPages, hasNext, hasPrev, nextPage, prevPage, goToPage, setPage, setLimit };
}
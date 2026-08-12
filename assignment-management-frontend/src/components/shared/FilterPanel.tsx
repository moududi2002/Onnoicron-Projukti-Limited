'use client';

import { ReactNode } from 'react';
import { HiFilter, HiX } from 'react-icons/hi';

interface FilterPanelProps {
  children: ReactNode;
  onClear: () => void;
  hasFilters: boolean;
}

export default function FilterPanel({ children, onClear, hasFilters }: FilterPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <HiFilter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        {hasFilters && (
          <button onClick={onClear} className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
            <HiX className="h-4 w-4 mr-1" /> Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}
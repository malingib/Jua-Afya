import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageNumbers } from '../../utils/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  className?: string;
}

/**
 * Reusable Pagination Component
 * Displays page numbers and navigation controls
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  className = '',
}) => {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 py-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        onClick={onPrevPage || (() => onPageChange(currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`
                  px-3 py-2 rounded-lg font-medium transition-colors
                  ${
                    currentPage === page
                      ? 'bg-teal-600 text-white dark:bg-teal-600'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }
                `}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={onNextPage || (() => onPageChange(currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;

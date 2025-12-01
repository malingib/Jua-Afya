import { useState, useCallback, useMemo } from 'react';
import { getPaginationState, PaginationState, paginate } from '../utils/pagination';

interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

/**
 * usePagination Hook
 * Manages pagination state and provides helpers for paginating items
 */
export const usePagination = <T,>(
  items: T[],
  options: UsePaginationOptions = {}
) => {
  const { initialPageSize = 10, initialPage = 1 } = options;

  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const state: PaginationState = useMemo(
    () =>
      getPaginationState({
        pageSize,
        currentPage,
        totalItems: items.length,
      }),
    [pageSize, currentPage, items.length]
  );

  const currentItems = useMemo(
    () => paginate(items, pageSize, currentPage),
    [items, pageSize, currentPage]
  );

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, state.totalPages));
    setCurrentPage(validPage);
  }, [state.totalPages]);

  const nextPage = useCallback(() => {
    if (state.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [state.hasNextPage]);

  const prevPage = useCallback(() => {
    if (state.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [state.hasPrevPage]);

  const setNewPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  }, []);

  return {
    ...state,
    currentItems,
    pageSize,
    setPageSize: setNewPageSize,
    goToPage,
    nextPage,
    prevPage,
  };
};

export default usePagination;

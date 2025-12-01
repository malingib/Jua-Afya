/**
 * Pagination Utilities
 * Provides helpers for paginating large lists
 */

export interface PaginationConfig {
  pageSize: number;
  currentPage: number;
  totalItems: number;
}

export interface PaginationState {
  pageSize: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Calculate pagination state
 */
export const getPaginationState = (config: PaginationConfig): PaginationState => {
  const { pageSize, currentPage, totalItems } = config;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return {
    pageSize,
    currentPage,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex,
    endIndex,
  };
};

/**
 * Paginate array items
 */
export const paginate = <T,>(
  items: T[],
  pageSize: number,
  currentPage: number
): T[] => {
  const state = getPaginationState({
    pageSize,
    currentPage,
    totalItems: items.length,
  });

  return items.slice(state.startIndex, state.endIndex);
};

/**
 * Get page numbers to display (with ellipsis)
 */
export const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const leftSide = Math.floor(maxVisible / 2);
  const rightSide = maxVisible - leftSide - 1;

  // Always show first page
  pages.push(1);

  // Add left ellipsis if needed
  if (currentPage > leftSide + 2) {
    pages.push('...');
  }

  // Add page range around current page
  const startPage = Math.max(2, currentPage - leftSide);
  const endPage = Math.min(totalPages - 1, currentPage + rightSide);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add right ellipsis if needed
  if (currentPage < totalPages - rightSide - 1) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

import React from 'react';

/**
 * Performance Optimization Utilities
 * Helpers for optimizing React component rendering
 */

/**
 * Memoization comparison function for deep object/array comparison
 */
export const deepCompare = (prevProps: any, nextProps: any): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      // Deep compare for objects and arrays
      if (typeof prevProps[key] === 'object' && typeof nextProps[key] === 'object') {
        return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
      }
      return false;
    }
  }

  return true;
};

/**
 * Memoize a component with custom comparison
 */
export const memoWithDeepCompare = <P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.NamedExoticComponent<P> => {
  return React.memo(Component, compare || deepCompare);
};

/**
 * Create a lazy loaded component wrapper
 * Usage: const LazyComponent = createLazyComponent(() => import('./Component'))
 */
export const createLazyComponent = <P extends object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>
): React.LazyExoticComponent<React.ComponentType<P>> => {
  return React.lazy(loader);
};

/**
 * Performance metrics measurement
 */
export const measurePerformance = (
  label: string,
  fn: () => void
): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return duration;
};

/**
 * Debounce function callback
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function callback
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastRun = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= delay) {
      fn(...args);
      lastRun = now;
    }
  };
};

/**
 * Create a memoized selector function for deriving values from state
 */
export const createSelector = <T, S>(
  source: T[],
  selector: (item: T) => S,
  isEqual: (a: S, b: S) => boolean = (a, b) => a === b
): S[] => {
  const previousResults = new Map<T, S>();

  return source.map(item => {
    const newValue = selector(item);
    const previousValue = previousResults.get(item);

    if (previousValue && isEqual(previousValue, newValue)) {
      return previousValue;
    }

    previousResults.set(item, newValue);
    return newValue;
  });
};

export default {
  deepCompare,
  memoWithDeepCompare,
  createLazyComponent,
  measurePerformance,
  debounce,
  throttle,
  createSelector,
};

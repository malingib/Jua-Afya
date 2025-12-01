import { useMemo } from 'react';

/**
 * useMemoizedValue Hook
 * Memoizes computed values based on dependencies
 * Prevents unnecessary recalculations
 */
export const useMemoizedValue = <T,>(
  computeFn: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(computeFn, dependencies);
};

/**
 * useMemoizedCallback Hook
 * Memoizes callback functions based on dependencies
 * Prevents unnecessary callback recreations
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useMemo(() => callback, dependencies) as T;
};

/**
 * useMemoizedArray Hook
 * Memoizes arrays based on deep equality
 */
export const useMemoizedArray = <T,>(
  array: T[],
  dependencies: React.DependencyList
): T[] => {
  return useMemo(() => [...array], dependencies);
};

/**
 * useMemoizedObject Hook
 * Memoizes objects based on key changes
 */
export const useMemoizedObject = <T extends Record<string, any>>(
  obj: T,
  dependencies: React.DependencyList
): T => {
  return useMemo(() => ({ ...obj }), dependencies);
};

export default useMemoizedValue;

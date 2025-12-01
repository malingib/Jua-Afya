import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * useAsync Hook
 * Manages async operation state (loading, data, error)
 * Useful for API calls, data fetching, and other async operations
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = false,
  dependencies: any[] = [],
  options?: UseAsyncOptions
) => {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  // Track if component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Execute the async function
  const execute = useCallback(
    async (onSuccess?: (data: T) => void) => {
      setState({ status: 'pending', data: null, error: null });

      try {
        const response = await asyncFunction();

        if (isMountedRef.current) {
          setState({ status: 'success', data: response, error: null });
          options?.onSuccess?.(response);
          onSuccess?.(response);
        }

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({ status: 'error', data: null, error: err });
          options?.onError?.(err);
        }

        throw err;
      } finally {
        options?.onSettled?.();
      }
    },
    [asyncFunction, options]
  );

  // Automatically execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  return {
    execute,
    ...state,
    isLoading: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
};

/**
 * useAsyncFn Hook
 * Similar to useAsync but useful for functions that take parameters
 */
export const useAsyncFn = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) => {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: Args) => {
      setState({ status: 'pending', data: null, error: null });

      try {
        const response = await fn(...args);

        if (isMountedRef.current) {
          setState({ status: 'success', data: response, error: null });
          onSuccess?.(response);
        }

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({ status: 'error', data: null, error: err });
          onError?.(err);
        }

        throw err;
      }
    },
    [fn, onSuccess, onError]
  );

  return { execute, ...state, isLoading: state.status === 'pending' };
};

export default useAsync;

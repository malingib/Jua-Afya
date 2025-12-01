import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  success: boolean;
}

/**
 * useLoadingState Hook
 * Manages loading, error, and success states for async operations
 * Useful for form submissions, API calls, and other async operations
 */
export const useLoadingState = () => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false,
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error: isLoading ? null : prev.error,
      success: isLoading ? false : prev.success,
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      success: false,
    }));
  }, []);

  const setSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      success: true,
      isLoading: false,
      error: null,
    }));
  }, []);

  const executeAsync = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setState({
        isLoading: true,
        error: null,
        success: false,
      });

      try {
        const result = await fn();
        setState({
          isLoading: false,
          error: null,
          success: true,
        });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({
          isLoading: false,
          error: err,
          success: false,
        });
        return null;
      }
    },
    []
  );

  return {
    ...state,
    reset,
    setLoading,
    setError,
    setSuccess,
    executeAsync,
  };
};

export default useLoadingState;

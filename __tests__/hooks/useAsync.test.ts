import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../../hooks/useAsync';

describe('useAsync', () => {
  it('should initialize with idle status', () => {
    const mockFn = jest.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(mockFn, false));

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should execute function and return data', async () => {
    const mockFn = jest.fn(() => Promise.resolve('test data'));
    const { result } = renderHook(() => useAsync(mockFn, false));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
    expect(mockFn).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn(() => Promise.reject(error));
    const { result } = renderHook(() => useAsync(mockFn, false));

    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBe(null);
  });

  it('should set loading state during execution', () => {
    const mockFn = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('data'), 100)));
    const { result } = renderHook(() => useAsync(mockFn, false));

    act(() => {
      result.current.execute();
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.isLoading).toBe(true);
  });

  it('should execute immediately if immediate is true', () => {
    const mockFn = jest.fn(() => Promise.resolve('data'));
    renderHook(() => useAsync(mockFn, true));

    expect(mockFn).toHaveBeenCalled();
  });
});

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * useLocalStorage Hook
 * Persists state to localStorage and syncs across browser tabs
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, { remove: () => void }] => {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch storage event for other tabs/windows
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
            url: window.location.href,
          })
        );
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage change for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Remove from localStorage
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, { remove }];
};

export default useLocalStorage;

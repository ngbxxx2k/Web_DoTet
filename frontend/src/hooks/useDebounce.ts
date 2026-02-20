
import { useState, useEffect } from 'react';

/**
 * Creates a debounced value that delays updating until a certain timeout has pased.
 * @param value The value to be debounced.
 * @param delay The delay in milliseconds (default: 500ms).
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

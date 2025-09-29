
import { useState, useCallback } from 'react';

/**
 * A custom hook for persisting state to window.localStorage.
 * This hook is designed to be a drop-in replacement for React.useState.
 *
 * FIX: This version correctly implements the functional update pattern
 * for the state setter, resolving a critical race condition bug where
 * rapid state updates could be lost. It now guarantees that every
 * update is applied to the latest state, ensuring data integrity.
 * The redundant and potentially problematic useEffect has also been removed.
 *
 * @param key The key to use for storing the value in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Lazy initialize state from localStorage to avoid reading on every render.
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    // Wrap the setter in useCallback to ensure it's stable between renders.
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Use the functional update form of useState's setter.
            // This is crucial for preventing race conditions by ensuring
            // that the new state is always based on the most recent previous state.
            setStoredValue(currentStoredValue => {
                const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                return valueToStore;
            });
        } catch (error) {
            console.error(`Error saving to localStorage key “${key}”:`, error);
        }
    }, [key]);

    return [storedValue, setValue];
}

export default useLocalStorage;
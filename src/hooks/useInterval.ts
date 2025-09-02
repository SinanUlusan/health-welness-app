import { useEffect, useRef } from "react";

/**
 * Custom hook for handling intervals with proper cleanup
 * Better alternative to useEffect for timer-based operations
 * FIXED: Removed callback from dependencies to prevent unnecessary re-renders
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if no delay is specified
    if (delay === null) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]); // Removed callback from dependencies
};

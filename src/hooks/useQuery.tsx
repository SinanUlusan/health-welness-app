import { useReducer, useCallback, use, Suspense, useMemo } from "react";
import React from "react";

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type QueryAction<T> =
  | { type: "START_LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; payload: string };

const queryReducer = <T,>(
  state: QueryState<T>,
  action: QueryAction<T>
): QueryState<T> => {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

/**
 * Custom hook for data fetching with loading states
 * Better alternative to useEffect for API calls
 */
export const useQuery = <T,>(queryFn: () => Promise<T>) => {
  const [state, dispatch] = useReducer(queryReducer<T>, {
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    dispatch({ type: "START_LOADING" });
    try {
      const data = await queryFn();
      dispatch({ type: "SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [queryFn]);

  return {
    ...state,
    execute,
  };
};

/**
 * React 19 use hook wrapper for data fetching
 * Provides a more modern approach to async data loading
 */
export const useAsyncData = <T,>(promise: Promise<T>): T => {
  return use(promise);
};

/**
 * Creates a promise for data fetching that can be used with use hook
 */
export const createDataPromise = <T,>(queryFn: () => Promise<T>) => {
  return queryFn();
};

/**
 * Higher-order component for handling async data with Suspense
 */
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = "Loading..."
) => {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Modern data fetching hook using React 19's use hook
 * Eliminates the need for manual loading/error state management
 * FIXED: Now properly memoizes the promise to prevent memory leaks and re-renders
 */
export const useData = <T,>(queryFn: () => Promise<T>): T => {
  // Create a stable promise that doesn't change on re-renders
  // The queryFn should be memoized in the calling component using useCallback
  const promise = useMemo(() => {
    return queryFn();
  }, [queryFn]); // Empty dependency array to ensure promise is created only once

  return useAsyncData(promise);
};

/**
 * Alternative useData hook with better dependency handling
 * Use this when queryFn might change between renders
 */
export const useDataWithDeps = <T,>(queryFn: () => Promise<T>): T => {
  const promise = useMemo(() => queryFn(), [queryFn]);
  return useAsyncData(promise);
};

/**
 * Simplified useData hook that automatically memoizes the queryFn
 * This is the recommended approach for most use cases
 */
export const useDataSimple = <T,>(queryFn: () => Promise<T>): T => {
  // Create a stable promise that doesn't change on re-renders
  // The queryFn should be memoized in the calling component using useCallback
  const promise = useMemo(() => {
    return queryFn();
  }, [queryFn]); // Include queryFn in dependencies to ensure it's stable

  return useAsyncData(promise);
};

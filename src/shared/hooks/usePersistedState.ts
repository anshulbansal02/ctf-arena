"use client";
import { useState, useEffect } from "react";

// Helper to retrieve state from localStorage, checking if window is defined
const getPersistedState = (key: string, initialState: any) => {
  if (typeof window === "undefined") {
    return initialState; // Return the initial state on the server side
  }

  const savedState = localStorage.getItem(key);
  return savedState ? JSON.parse(savedState) : initialState;
};

// The custom hook that persists state
const usePersistedState = <T>(
  key: string,
  initialState: T,
  options?: { noPersist?: boolean },
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // Initialize the state, retrieve from localStorage if available
  const [state, setState] = useState<T>(() =>
    getPersistedState(key, initialState),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setState(getPersistedState(key, initialState));
    }
  }, [key]);

  // Store the state in localStorage whenever it updates
  useEffect(() => {
    if (options?.noPersist || typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default usePersistedState;

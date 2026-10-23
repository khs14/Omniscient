import { useEffect, useState, useSyncExternalStore } from 'react';
import { getProgress, isPersistent, subscribe } from './storage.js';

/** Current progress; re-renders whenever it changes (including from other tabs). */
export function useProgress() {
  return useSyncExternalStore(subscribe, getProgress);
}

/** Whether progress is actually being saved to the browser. */
export function useIsPersistent() {
  return useSyncExternalStore(subscribe, isPersistent);
}

/**
 * The current time, refreshed every minute so "due today" counts stay correct
 * when the app is left open (and roll over at midnight).
 */
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

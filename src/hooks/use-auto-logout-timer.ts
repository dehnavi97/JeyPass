"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoLogoutTimer(
  onTimeout: () => void,
  timeoutDuration: number,
  isInitiallyPaused = false
) {
  const [remainingTime, setRemainingTime] = useState(timeoutDuration);
  const [isPaused, setIsPaused] = useState(isInitiallyPaused);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingOnPauseRef = useRef<number>(timeoutDuration);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const runTimer = useCallback(() => {
    clearTimers();
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(onTimeout, remainingOnPauseRef.current * 1000);

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const newRemaining = Math.max(0, remainingOnPauseRef.current - elapsed);
      setRemainingTime(newRemaining);

      if (newRemaining <= 0) {
        clearTimers();
      }
    }, 1000);
  }, [onTimeout, clearTimers]);


  useEffect(() => {
    if (isPaused) {
      clearTimers();
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      remainingOnPauseRef.current = Math.max(0, remainingOnPauseRef.current - elapsed);
      setRemainingTime(remainingOnPauseRef.current);
    } else {
      runTimer();
    }

    return clearTimers;
  }, [isPaused, runTimer, clearTimers]);

  const toggle = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  const reset = useCallback(() => {
    clearTimers();
    setIsPaused(false);
    setRemainingTime(timeoutDuration);
    remainingOnPauseRef.current = timeoutDuration;
    runTimer();
  }, [clearTimers, timeoutDuration, runTimer]);

  return { remainingTime, isPaused, toggle, reset };
}

import { useState, useRef, useEffect, useCallback } from "react";

interface UseStopwatchReturn {
  startStopwatch: () => void;
  elapsedMs: number;
}

export function useStopwatch(complete: boolean): UseStopwatchReturn {
  const startTimeRef = useRef<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startSignal, setStartSignal] = useState(0);

  const startStopwatch = useCallback(() => {
    setStartSignal((n) => n + 1);
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [startSignal]);

  useEffect(() => {
    if (complete) {
      setElapsedMs(Date.now() - startTimeRef.current);
    }
  }, [complete]);

  return { startStopwatch, elapsedMs };
}

import { useCallback, useRef, useState } from "react";
import { ResponseTimer } from "./responseTimer";

export interface UseResponseTimerReturn {
  start: () => void;
  stop: () => number;
  reset: () => void;
  isRunning: boolean;
  times: number[];
  totalTime: number;
  averageTime: number;
}

export function useResponseTimer(): UseResponseTimerReturn {
  const timerRef = useRef<ResponseTimer>(new ResponseTimer());
  const [times, setTimes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(() => {
    if (timerRef.current.isRunning()) return;
    timerRef.current.start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (!timerRef.current.isRunning()) {
      setTimes(timerRef.current.getTimes());
      setIsRunning(false);
      return 0;
    }

    const elapsedMs = timerRef.current.stop();
    setTimes(timerRef.current.getTimes());
    setIsRunning(false);
    return elapsedMs;
  }, []);

  const reset = useCallback(() => {
    timerRef.current.reset();
    setTimes([]);
    setIsRunning(false);
  }, []);

  const totalTime = times.reduce((sum, value) => sum + value, 0);
  const averageTime = times.length === 0 ? 0 : totalTime / times.length;

  return {
    start,
    stop,
    reset,
    isRunning,
    times,
    totalTime,
    averageTime,
  };
}

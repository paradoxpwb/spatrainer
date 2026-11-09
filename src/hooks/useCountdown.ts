import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
}

export function useCountdown(options?: UseCountdownOptions) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const targetEndTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const onCompleteRef = useRef(options?.onComplete);

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    targetEndTimeRef.current = null;
    setIsRunning(false);
  }, [clearTimer]);

  const start = useCallback(
    (durationInSeconds: number) => {
      clearTimer();
      const safeDuration = Math.max(1, Math.round(durationInSeconds));
      setTotalDuration(safeDuration);
      setTimeRemaining(safeDuration);
      setIsFinished(false);
      setIsRunning(true);

      const endTime = performance.now() + safeDuration * 1000;
      targetEndTimeRef.current = endTime;

      timerIdRef.current = window.setInterval(() => {
        if (targetEndTimeRef.current === null) return;
        const now = performance.now();
        const diffMs = targetEndTimeRef.current - now;
        const remainingSec = Math.max(0, Math.ceil(diffMs / 1000));

        setTimeRemaining(remainingSec);

        if (diffMs <= 0) {
          clearTimer();
          targetEndTimeRef.current = null;
          setIsRunning(false);
          setIsFinished(true);
          setTimeRemaining(0);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
      }, 100);
    },
    [clearTimer]
  );

  const reset = useCallback(() => {
    stop();
    setTimeRemaining(0);
    setTotalDuration(0);
    setIsFinished(false);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const progress = totalDuration > 0
    ? Math.min(1, Math.max(0, (totalDuration - timeRemaining) / totalDuration))
    : 0;

  return {
    timeRemaining,
    totalDuration,
    isRunning,
    isFinished,
    progress,
    start,
    stop,
    reset,
  };
}

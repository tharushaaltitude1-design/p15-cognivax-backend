import { useCallback, useEffect, useRef, useState } from "react";

import { FAILED_ATTEMPT_COOLDOWN_MS, MAX_FAILED_ATTEMPTS } from "./constants";

/** Client-side throttle after repeated failed sign-in attempts. */
export function useFailedAttempts() {
  const failures = useRef(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (lockedUntil === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const locked = lockedUntil !== null && now < lockedUntil;
  const secondsLeft = locked ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;

  const registerFailure = useCallback(() => {
    failures.current += 1;
    if (failures.current >= MAX_FAILED_ATTEMPTS) {
      setLockedUntil(Date.now() + FAILED_ATTEMPT_COOLDOWN_MS);
    }
  }, []);

  const reset = useCallback(() => {
    failures.current = 0;
    setLockedUntil(null);
  }, []);

  return { locked, secondsLeft, registerFailure, reset };
}

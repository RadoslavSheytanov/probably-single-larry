import { useEffect, useRef } from 'react';
import { heartbeat } from '../services/license';

// Heartbeat every 3 minutes. Server TTL is 10 minutes — plenty of headroom.
const HEARTBEAT_INTERVAL_MS = 3 * 60 * 1000;

interface Options {
  enabled: boolean;
  onExpired: () => void;
}

export function useHeartbeat({ enabled, onExpired }: Options): void {
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!enabled) return;

    async function beat() {
      if (document.hidden) return; // Don't heartbeat when app is backgrounded
      const result = await heartbeat();
      // NETWORK_ERROR is a transient failure — don't log out, retry next interval
      if (!result.ok && result.code !== 'NETWORK_ERROR') {
        onExpiredRef.current();
      }
    }

    // Check immediately when session first becomes active
    beat();

    const intervalId = setInterval(beat, HEARTBEAT_INTERVAL_MS);

    // Re-check when tab comes back to foreground (avoids stale session after long background)
    const onVisibilityChange = () => { if (!document.hidden) beat(); };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled]); // re-run only when enabled changes
}

let wakeLock: WakeLockSentinel | null = null;

export async function acquireWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch {
    // Not supported or permission denied — fail silently
  }
}

export function releaseWakeLock(): void {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

// Re-acquire if tab becomes visible again while in stealth mode
export function setupWakeLockReacquire(isActiveRef: () => boolean): () => void {
  async function onVisibilityChange() {
    if (document.visibilityState === 'visible' && isActiveRef()) {
      await acquireWakeLock();
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => document.removeEventListener('visibilitychange', onVisibilityChange);
}

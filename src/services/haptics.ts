// All haptic patterns from SPEC.md
// navigator.vibrate is not available on iOS — fails silently

let iosHapticsEnabled = true;
let iosSwitch: HTMLInputElement | null = null;

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function ensureIosSwitch() {
  if (typeof document === 'undefined') return null;
  if (iosSwitch) return iosSwitch;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('role', 'switch');
  input.setAttribute('aria-hidden', 'true');
  input.tabIndex = -1;
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  input.style.top = '0';
  input.style.opacity = '0';
  input.style.pointerEvents = 'none';
  document.body.appendChild(input);
  iosSwitch = input;
  return iosSwitch;
}

function pulseIosFallback() {
  if (!iosHapticsEnabled || !isIosDevice()) return;
  const input = ensureIosSwitch();
  if (!input) return;

  try {
    input.click();
  } catch {
    // Ignore unsupported programmatic click behaviour on iOS.
  }
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
      return;
    }
  } catch {
    // Silently ignore — iOS Safari does not support vibration
  }

  pulseIosFallback();
}

export const haptics = {
  configureIosFallback: (enabled: boolean) => {
    iosHapticsEnabled = enabled;
  },

  /** Initial day/month choice */
  comparison: () => vibrate(12),

  /** +1 tap */
  tapOne: () => vibrate(10),

  /** +10 tap */
  tapTen: () => vibrate([10, 30, 10]),

  /** Long-press confirm */
  confirm: () => vibrate([15, 40, 15, 40, 15]),

  /** Undo last increment */
  undo: () => vibrate(50),

  /** Error / warning (anchor too low, two options detected) */
  error: () => vibrate([30, 50, 30, 50, 30]),

  /** Result computed (ascending pattern) */
  result: () => vibrate([8, 30, 12, 30, 20]),

  /** Two possible dates — signal performer to peek screen */
  ambiguous: () => vibrate([20, 80, 20]),

  /** Ambiguous resolved — single date confirmed */
  resolved: () => vibrate([15, 30, 15]),

  /** Go back / phase reset (swipe left) — softer than error */
  back: () => vibrate([10, 40, 10]),

  /** Exit performance mode (swipe down) */
  exit: () => vibrate(30),
};

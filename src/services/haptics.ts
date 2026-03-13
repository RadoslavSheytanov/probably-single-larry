// All haptic patterns from SPEC.md
// navigator.vibrate is not available on iOS — fails silently

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently ignore — iOS Safari does not support vibration
  }
}

export const haptics = {
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
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => () => null,
  }),
  AnimatePresence: () => null,
}));

vi.mock('../services/haptics', () => ({
  haptics: {
    tapOne: vi.fn(), tapTen: vi.fn(), confirm: vi.fn(), error: vi.fn(),
    result: vi.fn(), ambiguous: vi.fn(), undo: vi.fn(), back: vi.fn(),
    exit: vi.fn(), resolved: vi.fn(),
  },
}));
vi.mock('../services/ntfy', () => ({ ntfySend: vi.fn() }));
vi.mock('../services/wakeLock', () => ({
  acquireWakeLock: vi.fn(),
  releaseWakeLock: vi.fn(),
  setupWakeLockReacquire: vi.fn(() => vi.fn()),
}));

import { useStore } from '../state/store';
import { compute } from '../engine/singularis';

const CLEAN_STEALTH = {
  phase: 'ANCHOR' as const,
  anchorValue: 0,
  differenceValue: 0,
  lastAdded: 0,
  engineResult: null,
  resolvedDate: null,
};

function resetStore() {
  useStore.setState({
    screen: 'home',
    stealth: { ...CLEAN_STEALTH },
    history: [],
    settings: { ntfyTopic: '', hapticFeedback: true },
  });
}

beforeEach(() => {
  resetStore();
});

// ─── Flow 1: Complete unambiguous performance ─────────────────────────────────

describe('Flow 1: Complete unambiguous performance (A=24, D=10 → July 17, Cancer)', () => {
  it('reaches COMPUTED with correct resolvedDate', () => {
    const { incrementAnchor, confirmAnchor, incrementDifference, confirmDifference } =
      useStore.getState();

    // Build anchorValue = 24
    incrementAnchor(10);
    incrementAnchor(10);
    incrementAnchor(1);
    incrementAnchor(1);
    incrementAnchor(1);
    incrementAnchor(1);
    expect(useStore.getState().stealth.anchorValue).toBe(24);

    confirmAnchor();
    expect(useStore.getState().stealth.phase).toBe('DIFFERENCE');

    // Build differenceValue = 10
    useStore.getState().incrementDifference(10);
    expect(useStore.getState().stealth.differenceValue).toBe(10);

    const result = compute(24, 10);
    useStore.getState().confirmDifference(result);

    const stealth = useStore.getState().stealth;
    expect(stealth.phase).toBe('COMPUTED');
    expect(stealth.resolvedDate).not.toBeNull();
    expect(stealth.resolvedDate!.month).toBe(7);
    expect(stealth.resolvedDate!.day).toBe(17);
    expect(stealth.resolvedDate!.sign.name).toBe('Cancer');
  });
});

// ─── Flow 2: Undo during ANCHOR ───────────────────────────────────────────────

describe('Flow 2: Undo during ANCHOR', () => {
  it('removes the lastAdded amount on undoLast', () => {
    const { incrementAnchor, undoLast } = useStore.getState();

    incrementAnchor(10);
    expect(useStore.getState().stealth.anchorValue).toBe(10);
    expect(useStore.getState().stealth.lastAdded).toBe(10);

    incrementAnchor(1);
    expect(useStore.getState().stealth.anchorValue).toBe(11);
    expect(useStore.getState().stealth.lastAdded).toBe(1);

    undoLast();
    expect(useStore.getState().stealth.anchorValue).toBe(10);
    expect(useStore.getState().stealth.lastAdded).toBe(0);
  });

  it('does not go below zero on undo', () => {
    useStore.getState().incrementAnchor(1);
    useStore.getState().undoLast();
    useStore.getState().undoLast(); // second undo when lastAdded=0
    expect(useStore.getState().stealth.anchorValue).toBe(0);
  });
});

// ─── Flow 3: Three-finger reset during DIFFERENCE ─────────────────────────────

describe('Flow 3: Three-finger reset during DIFFERENCE', () => {
  it('resets differenceValue to 0 but keeps phase as DIFFERENCE', () => {
    useStore.setState({
      stealth: { ...CLEAN_STEALTH, anchorValue: 24 },
    });
    useStore.getState().confirmAnchor();
    useStore.getState().incrementDifference(10);

    expect(useStore.getState().stealth.differenceValue).toBe(10);
    expect(useStore.getState().stealth.phase).toBe('DIFFERENCE');

    useStore.getState().resetCurrentPhase();

    expect(useStore.getState().stealth.differenceValue).toBe(0);
    expect(useStore.getState().stealth.phase).toBe('DIFFERENCE');
    expect(useStore.getState().stealth.anchorValue).toBe(24);
  });
});

// ─── Flow 4: Go back from DIFFERENCE to ANCHOR ───────────────────────────────

describe('Flow 4: Go back from DIFFERENCE to ANCHOR', () => {
  it('resets to ANCHOR with anchorValue=0 via goBackPhase', () => {
    useStore.setState({
      stealth: { ...CLEAN_STEALTH, anchorValue: 24 },
    });
    useStore.getState().confirmAnchor();
    expect(useStore.getState().stealth.phase).toBe('DIFFERENCE');
    expect(useStore.getState().stealth.anchorValue).toBe(24);

    useStore.getState().goBackPhase();

    const stealth = useStore.getState().stealth;
    expect(stealth.phase).toBe('ANCHOR');
    expect(stealth.anchorValue).toBe(0);
    expect(stealth.differenceValue).toBe(0);
  });
});

// ─── Flow 5: Ambiguous result flow ───────────────────────────────────────────

describe('Flow 5: Ambiguous result flow', () => {
  it('enters RESOLVING phase and resolves to COMPUTED', () => {
    // Find an ambiguous pair: A=13, D=3 → smaller=5, larger=8 → both ≤12 → ambiguous
    // smaller=5 (month), larger=8 (day): May 8 valid; larger=8 (month), smaller=5 (day): Aug 5 valid
    useStore.setState({
      stealth: { ...CLEAN_STEALTH, anchorValue: 13 },
    });
    useStore.getState().confirmAnchor();

    useStore.getState().incrementDifference(1);
    useStore.getState().incrementDifference(1);
    useStore.getState().incrementDifference(1);
    expect(useStore.getState().stealth.differenceValue).toBe(3);

    const result = compute(13, 3);
    expect(result.kind).toBe('ambiguous');
    if (result.kind !== 'ambiguous') return;

    useStore.getState().confirmDifference(result);
    expect(useStore.getState().stealth.phase).toBe('RESOLVING');
    expect(useStore.getState().stealth.resolvedDate).toBeNull();

    useStore.getState().resolveAmbiguous(result.primary);
    const stealth = useStore.getState().stealth;
    expect(stealth.phase).toBe('COMPUTED');
    expect(stealth.resolvedDate).toEqual(result.primary);
  });
});

// ─── Flow 6: Error state handling ────────────────────────────────────────────

describe('Flow 6: Error state handling', () => {
  it('compute returns error for odd difference (A=10, D=3)', () => {
    const result = compute(10, 3);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('odd_difference');
  });

  it('compute returns error for anchor_too_low (A=3, D=0)', () => {
    const result = compute(3, 0);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('anchor_too_low');
  });

  it('compute returns error when d exceeds a', () => {
    const result = compute(5, 8);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('d_exceeds_a');
  });

  it('store phase stays DIFFERENCE after confirmAnchor when no confirmDifference called on error path', () => {
    useStore.setState({
      stealth: { ...CLEAN_STEALTH, anchorValue: 10 },
    });
    useStore.getState().confirmAnchor();
    useStore.getState().incrementDifference(1);
    useStore.getState().incrementDifference(1);
    useStore.getState().incrementDifference(1);

    // Simulate the hook catching an error: confirmDifference is NOT called
    const result = compute(10, 3);
    expect(result.kind).toBe('error');

    // Phase remains DIFFERENCE — the hook doesn't call confirmDifference on error
    expect(useStore.getState().stealth.phase).toBe('DIFFERENCE');
  });
});

// ─── Flow 7: History accumulation ────────────────────────────────────────────

describe('Flow 7: History accumulation', () => {
  const makeReading = (id: string) => ({
    id,
    timestamp: Date.now(),
    result: { kind: 'ok' as const, primary: {
      day: 17, month: 7,
      sign: { name: 'Cancer', symbol: '♋', element: 'Water' as const, dateRange: 'Jun 21 – Jul 22' },
    }, alternate: null },
    resolvedDate: {
      day: 17, month: 7,
      sign: { name: 'Cancer', symbol: '♋', element: 'Water' as const, dateRange: 'Jun 21 – Jul 22' },
    },
  });

  it('accumulates readings and prepends new ones', () => {
    useStore.getState().addReading(makeReading('r1'));
    expect(useStore.getState().history).toHaveLength(1);

    useStore.getState().addReading(makeReading('r2'));
    expect(useStore.getState().history).toHaveLength(2);
    // Most recent first
    expect(useStore.getState().history[0].id).toBe('r2');
    expect(useStore.getState().history[1].id).toBe('r1');
  });

  it('clearHistory empties the history array', () => {
    useStore.getState().addReading(makeReading('r1'));
    useStore.getState().addReading(makeReading('r2'));
    useStore.getState().clearHistory();
    expect(useStore.getState().history).toHaveLength(0);
  });
});

// ─── Flow 8: 100-entry cap ────────────────────────────────────────────────────

describe('Flow 8: 100-entry cap', () => {
  it('caps history at 100 entries and drops the oldest', () => {
    const makeReading = (id: string) => ({
      id,
      timestamp: Date.now(),
      result: { kind: 'ok' as const, primary: {
        day: 1, month: 1,
        sign: { name: 'Capricorn', symbol: '♑', element: 'Earth' as const, dateRange: 'Dec 22 – Jan 19' },
      }, alternate: null },
      resolvedDate: {
        day: 1, month: 1,
        sign: { name: 'Capricorn', symbol: '♑', element: 'Earth' as const, dateRange: 'Dec 22 – Jan 19' },
      },
    });

    // Add 101 readings
    for (let i = 0; i < 101; i++) {
      useStore.getState().addReading(makeReading(`reading-${i}`));
    }

    const history = useStore.getState().history;
    expect(history).toHaveLength(100);

    // The oldest reading (reading-0) should be dropped — it was added first (ends up at end)
    // After 101 additions: history = [reading-100, reading-99, ..., reading-1]
    // reading-0 was the first added, so it ends up being sliced off
    expect(history[history.length - 1].id).toBe('reading-1');
    expect(history.find((r) => r.id === 'reading-0')).toBeUndefined();
  });
});

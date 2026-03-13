import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';
import type { EngineResult, ResolvedDate, Reading } from '../utils/types';

const INITIAL_STATE = {
  screen: 'home' as const,
  stealth: {
    phase: 'ANCHOR' as const,
    anchorValue: 0,
    differenceValue: 0,
    lastAdded: 0,
    engineResult: null,
    resolvedDate: null,
  },
  history: [] as Reading[],
  settings: { ntfyTopic: '', hapticFeedback: true },
};

beforeEach(() => {
  useStore.setState(INITIAL_STATE);
});

// ── Fixtures ────────────────────────────────────────────────────────────────

const cancerSign = {
  name: 'Cancer',
  symbol: '♋',
  element: 'Water' as const,
  dateRange: 'Jun 21 – Jul 22',
};

const dateJul17: ResolvedDate = { day: 17, month: 7, sign: cancerSign };
const dateJan15: ResolvedDate = {
  day: 15,
  month: 1,
  sign: { name: 'Capricorn', symbol: '♑', element: 'Earth' as const, dateRange: 'Dec 22 – Jan 19' },
};

const okResult: EngineResult = { kind: 'ok', primary: dateJul17, alternate: null };
const ambiguousResult: EngineResult = { kind: 'ambiguous', primary: dateJul17, alternate: dateJan15 };

// ── Navigation ───────────────────────────────────────────────────────────────

describe('setScreen', () => {
  it('navigates to stealth screen', () => {
    useStore.getState().setScreen('stealth');
    expect(useStore.getState().screen).toBe('stealth');
  });

  it('navigates back to home', () => {
    useStore.getState().setScreen('settings');
    useStore.getState().setScreen('home');
    expect(useStore.getState().screen).toBe('home');
  });

  it('navigates to result screen', () => {
    useStore.getState().setScreen('result');
    expect(useStore.getState().screen).toBe('result');
  });
});

// ── Stealth: increment ────────────────────────────────────────────────────────

describe('incrementAnchor', () => {
  it('adds amount to anchorValue', () => {
    useStore.getState().incrementAnchor(10);
    expect(useStore.getState().stealth.anchorValue).toBe(10);
  });

  it('accumulates multiple increments', () => {
    useStore.getState().incrementAnchor(10);
    useStore.getState().incrementAnchor(1);
    expect(useStore.getState().stealth.anchorValue).toBe(11);
  });

  it('tracks lastAdded', () => {
    useStore.getState().incrementAnchor(10);
    expect(useStore.getState().stealth.lastAdded).toBe(10);
    useStore.getState().incrementAnchor(1);
    expect(useStore.getState().stealth.lastAdded).toBe(1);
  });
});

describe('incrementDifference', () => {
  it('adds amount to differenceValue', () => {
    useStore.getState().incrementDifference(5);
    expect(useStore.getState().stealth.differenceValue).toBe(5);
  });

  it('accumulates multiple increments', () => {
    useStore.getState().incrementDifference(10);
    useStore.getState().incrementDifference(10);
    expect(useStore.getState().stealth.differenceValue).toBe(20);
  });

  it('tracks lastAdded', () => {
    useStore.getState().incrementDifference(10);
    expect(useStore.getState().stealth.lastAdded).toBe(10);
  });
});

// ── Stealth: undoLast ────────────────────────────────────────────────────────

describe('undoLast', () => {
  it('removes lastAdded from anchorValue in ANCHOR phase', () => {
    useStore.getState().incrementAnchor(10);
    useStore.getState().incrementAnchor(1);
    useStore.getState().undoLast();
    expect(useStore.getState().stealth.anchorValue).toBe(10);
    expect(useStore.getState().stealth.lastAdded).toBe(0);
  });

  it('floors anchorValue at 0 in ANCHOR phase', () => {
    useStore.setState({
      stealth: { ...INITIAL_STATE.stealth, anchorValue: 3, lastAdded: 10 },
    });
    useStore.getState().undoLast();
    expect(useStore.getState().stealth.anchorValue).toBe(0);
  });

  it('removes lastAdded from differenceValue in DIFFERENCE phase', () => {
    useStore.setState({
      stealth: {
        ...INITIAL_STATE.stealth,
        phase: 'DIFFERENCE',
        differenceValue: 11,
        lastAdded: 1,
      },
    });
    useStore.getState().undoLast();
    expect(useStore.getState().stealth.differenceValue).toBe(10);
    expect(useStore.getState().stealth.lastAdded).toBe(0);
  });

  it('floors differenceValue at 0 in DIFFERENCE phase', () => {
    useStore.setState({
      stealth: {
        ...INITIAL_STATE.stealth,
        phase: 'DIFFERENCE',
        differenceValue: 2,
        lastAdded: 10,
      },
    });
    useStore.getState().undoLast();
    expect(useStore.getState().stealth.differenceValue).toBe(0);
  });
});

// ── Stealth: goBackPhase ──────────────────────────────────────────────────────

describe('goBackPhase', () => {
  it('resets all stealth state to default from DIFFERENCE phase', () => {
    useStore.setState({
      stealth: {
        phase: 'DIFFERENCE',
        anchorValue: 24,
        differenceValue: 10,
        lastAdded: 1,
        engineResult: null,
        resolvedDate: null,
      },
    });
    useStore.getState().goBackPhase();
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('ANCHOR');
    expect(s.anchorValue).toBe(0);
    expect(s.differenceValue).toBe(0);
    expect(s.lastAdded).toBe(0);
  });

  it('resets all stealth state to default from ANCHOR phase', () => {
    useStore.setState({
      stealth: { ...INITIAL_STATE.stealth, anchorValue: 5, lastAdded: 5 },
    });
    useStore.getState().goBackPhase();
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('ANCHOR');
    expect(s.anchorValue).toBe(0);
    expect(s.lastAdded).toBe(0);
  });
});

// ── Stealth: resetCurrentPhase ────────────────────────────────────────────────

describe('resetCurrentPhase', () => {
  it('zeros anchorValue only in ANCHOR phase', () => {
    useStore.setState({
      stealth: {
        ...INITIAL_STATE.stealth,
        anchorValue: 24,
        lastAdded: 1,
      },
    });
    useStore.getState().resetCurrentPhase();
    const s = useStore.getState().stealth;
    expect(s.anchorValue).toBe(0);
    expect(s.lastAdded).toBe(0);
    expect(s.phase).toBe('ANCHOR');
  });

  it('zeros differenceValue only in DIFFERENCE phase', () => {
    useStore.setState({
      stealth: {
        ...INITIAL_STATE.stealth,
        phase: 'DIFFERENCE',
        anchorValue: 24,
        differenceValue: 10,
        lastAdded: 1,
      },
    });
    useStore.getState().resetCurrentPhase();
    const s = useStore.getState().stealth;
    expect(s.differenceValue).toBe(0);
    expect(s.lastAdded).toBe(0);
    expect(s.anchorValue).toBe(24); // unchanged
    expect(s.phase).toBe('DIFFERENCE');
  });
});

// ── Stealth: confirmAnchor ────────────────────────────────────────────────────

describe('confirmAnchor', () => {
  it('sets phase to DIFFERENCE and clears lastAdded', () => {
    useStore.setState({
      stealth: { ...INITIAL_STATE.stealth, anchorValue: 24, lastAdded: 4 },
    });
    useStore.getState().confirmAnchor();
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('DIFFERENCE');
    expect(s.lastAdded).toBe(0);
    expect(s.anchorValue).toBe(24); // preserved
  });
});

// ── Stealth: confirmDifference ────────────────────────────────────────────────

describe('confirmDifference', () => {
  it('with ok result: sets phase to COMPUTED and sets resolvedDate', () => {
    useStore.getState().confirmDifference(okResult);
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('COMPUTED');
    expect(s.engineResult).toEqual(okResult);
    expect(s.resolvedDate).toEqual(dateJul17);
  });

  it('with ambiguous result: sets phase to RESOLVING, resolvedDate null', () => {
    useStore.getState().confirmDifference(ambiguousResult);
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('RESOLVING');
    expect(s.engineResult).toEqual(ambiguousResult);
    expect(s.resolvedDate).toBeNull();
  });
});

// ── Stealth: resolveAmbiguous ─────────────────────────────────────────────────

describe('resolveAmbiguous', () => {
  it('sets phase to COMPUTED and sets resolvedDate', () => {
    useStore.setState({
      stealth: { ...INITIAL_STATE.stealth, phase: 'RESOLVING', engineResult: ambiguousResult },
    });
    useStore.getState().resolveAmbiguous(dateJul17);
    const s = useStore.getState().stealth;
    expect(s.phase).toBe('COMPUTED');
    expect(s.resolvedDate).toEqual(dateJul17);
  });
});

// ── Stealth: resetStealth ─────────────────────────────────────────────────────

describe('resetStealth', () => {
  it('resets all stealth state to defaults', () => {
    useStore.setState({
      stealth: {
        phase: 'COMPUTED',
        anchorValue: 24,
        differenceValue: 10,
        lastAdded: 5,
        engineResult: okResult,
        resolvedDate: dateJul17,
      },
    });
    useStore.getState().resetStealth();
    expect(useStore.getState().stealth).toEqual(INITIAL_STATE.stealth);
  });
});

// ── History ───────────────────────────────────────────────────────────────────

describe('addReading', () => {
  it('prepends reading to history', () => {
    const r1: Reading = { id: '1', timestamp: 1000, result: okResult, resolvedDate: dateJul17 };
    const r2: Reading = { id: '2', timestamp: 2000, result: okResult, resolvedDate: dateJul17 };
    useStore.getState().addReading(r1);
    useStore.getState().addReading(r2);
    const h = useStore.getState().history;
    expect(h[0]).toEqual(r2);
    expect(h[1]).toEqual(r1);
  });

  it('caps history at 100 entries', () => {
    for (let i = 0; i < 105; i++) {
      const r: Reading = {
        id: String(i),
        timestamp: i,
        result: okResult,
        resolvedDate: dateJul17,
      };
      useStore.getState().addReading(r);
    }
    expect(useStore.getState().history).toHaveLength(100);
  });
});

describe('clearHistory', () => {
  it('empties history', () => {
    const r: Reading = { id: '1', timestamp: 1000, result: okResult, resolvedDate: dateJul17 };
    useStore.getState().addReading(r);
    useStore.getState().clearHistory();
    expect(useStore.getState().history).toHaveLength(0);
  });
});

// ── Settings ──────────────────────────────────────────────────────────────────

describe('updateSettings', () => {
  it('merges ntfyTopic patch into settings', () => {
    useStore.getState().updateSettings({ ntfyTopic: 'my-topic' });
    expect(useStore.getState().settings.ntfyTopic).toBe('my-topic');
    expect(useStore.getState().settings.hapticFeedback).toBe(true); // unchanged
  });

  it('merges hapticFeedback patch into settings', () => {
    useStore.getState().updateSettings({ hapticFeedback: false });
    expect(useStore.getState().settings.hapticFeedback).toBe(false);
    expect(useStore.getState().settings.ntfyTopic).toBe(''); // unchanged
  });

  it('merges multiple fields at once', () => {
    useStore.getState().updateSettings({ ntfyTopic: 'test', hapticFeedback: false });
    expect(useStore.getState().settings).toEqual({ ntfyTopic: 'test', hapticFeedback: false });
  });
});

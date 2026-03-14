import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Must be in the same file due to vi.mock hoisting
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      const tag = String(prop);
      return ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
        const { initial, animate, exit, transition, whileTap, variants, ...domProps } =
          props as Record<string, unknown>;
        void initial; void animate; void exit; void transition; void whileTap; void variants;
        return React.createElement(tag, domProps as React.HTMLAttributes<HTMLElement>, children);
      };
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock('../services/haptics', () => ({
  haptics: {
    tapOne: vi.fn(),
    tapTen: vi.fn(),
    confirm: vi.fn(),
    error: vi.fn(),
    result: vi.fn(),
    ambiguous: vi.fn(),
    undo: vi.fn(),
    back: vi.fn(),
    exit: vi.fn(),
    resolved: vi.fn(),
  },
}));

vi.mock('../services/ntfy', () => ({ ntfySend: vi.fn() }));

vi.mock('../services/wakeLock', () => ({
  acquireWakeLock: vi.fn(),
  releaseWakeLock: vi.fn(),
  setupWakeLockReacquire: vi.fn(() => vi.fn()),
}));

import React from 'react';
import { useStore } from '../state/store';
import Home from './Home';
import History from './History';
import ResultPeek from './ResultPeek';
import Settings from './Settings';
import type { ResolvedDate } from '../utils/types';

const CLEAN_STEALTH = {
  phase: 'ANCHOR' as const,
  anchorValue: 0,
  differenceValue: 0,
  lastAdded: 0,
  engineResult: null,
  resolvedDate: null,
};

const CLEAN_STATE = {
  screen: 'home' as const,
  stealth: CLEAN_STEALTH,
  history: [] as ReturnType<typeof useStore.getState>['history'],
  settings: { ntfyTopic: '', ntfyEnabled: true, hapticFeedback: true },
};

const CANCER_DATE: ResolvedDate = {
  day: 17,
  month: 7,
  sign: {
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    dateRange: 'Jun 21 – Jul 22',
  },
};

beforeEach(() => {
  // Merge mode (no second arg) preserves action functions on the store
  useStore.setState(CLEAN_STATE);
});

// ─── Home ─────────────────────────────────────────────────────────────────────

describe('Home screen', () => {
  it('renders primary action button', () => {
    render(<Home />);
    expect(screen.getByText('To set up push notifications, open Settings.')).toBeInTheDocument();
  });

  it('renders "History" nav button', () => {
    render(<Home />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('renders "Guide" nav button', () => {
    render(<Home />);
    expect(screen.getAllByText('Guide').length).toBeGreaterThan(0);
  });

  it('renders "Settings" nav button', () => {
    render(<Home />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('clicking "Settings" button calls setScreen("settings")', () => {
    render(<Home />);
    const btn = screen.getByText('Settings').closest('button')!;
    fireEvent.click(btn);
    expect(useStore.getState().screen).toBe('settings');
  });

  it('clicking "History" button calls setScreen("history")', () => {
    render(<Home />);
    const btn = screen.getByText('History').closest('button')!;
    fireEvent.click(btn);
    expect(useStore.getState().screen).toBe('history');
  });

  it('when there is a last reading, shows the reading label', () => {
    useStore.setState({
      history: [
        {
          id: 'test-1',
          timestamp: Date.now(),
          result: { kind: 'ok', primary: CANCER_DATE, alternate: null },
          resolvedDate: CANCER_DATE,
        },
      ],
    });
    render(<Home />);
    expect(screen.getAllByText('Last reading').length).toBeGreaterThan(0);
    expect(screen.getByText(/Cancer/)).toBeInTheDocument();
    expect(screen.getByText(/July.*17|17.*July/)).toBeInTheDocument();
  });

  it('when ntfyTopic is empty, shows notification setup prompt', () => {
    render(<Home />);
    expect(
      screen.getByText(/set up push notifications/i)
    ).toBeInTheDocument();
  });

  it('does not show ntfy warning when ntfyTopic is set', () => {
    useStore.setState({
      settings: { ntfyTopic: 'my-topic', ntfyEnabled: true, hapticFeedback: true },
    });
    render(<Home />);
    expect(
      screen.queryByText(/set up push notifications/i)
    ).not.toBeInTheDocument();
  });

  it('routes primary action to settings when ntfyTopic is empty', () => {
    render(<Home />);
    fireEvent.click(screen.getByText('To set up push notifications, open Settings.'));
    expect(useStore.getState().screen).toBe('settings');
  });

  it('routes primary action to stealth when ntfyTopic is configured', () => {
    useStore.setState({
      settings: { ntfyTopic: 'my-topic', ntfyEnabled: true, hapticFeedback: true },
    });
    render(<Home />);
    fireEvent.click(screen.getByText('Performance').closest('button')!);
    expect(useStore.getState().screen).toBe('stealth');
  });

  it('does not show ntfy warning when push notifications are disabled', () => {
    useStore.setState({
      settings: { ntfyTopic: '', ntfyEnabled: false, hapticFeedback: true },
    });
    render(<Home />);
    expect(screen.queryByText(/set up push notifications/i)).not.toBeInTheDocument();
  });

  it('routes primary action to stealth when push notifications are disabled', () => {
    useStore.setState({
      settings: { ntfyTopic: '', ntfyEnabled: false, hapticFeedback: true },
    });
    render(<Home />);
    fireEvent.click(screen.getByText('Performance').closest('button')!);
    expect(useStore.getState().screen).toBe('stealth');
  });
});

// ─── History ──────────────────────────────────────────────────────────────────

describe('History screen', () => {
  it('renders "No readings yet" when history is empty', () => {
    render(<History />);
    expect(screen.getByText(/no readings yet/i)).toBeInTheDocument();
  });

  it('renders reading entries when history has items', () => {
    useStore.setState({
      history: [
        {
          id: 'r1',
          timestamp: Date.now(),
          result: { kind: 'ok', primary: CANCER_DATE, alternate: null },
          resolvedDate: CANCER_DATE,
        },
      ],
    });
    render(<History />);
    expect(screen.queryByText(/no readings yet/i)).not.toBeInTheDocument();
  });

  it('renders correct sign symbol and date for a reading', () => {
    useStore.setState({
      history: [
        {
          id: 'r2',
          timestamp: Date.now(),
          result: { kind: 'ok', primary: CANCER_DATE, alternate: null },
          resolvedDate: CANCER_DATE,
        },
      ],
    });
    render(<History />);
    expect(screen.getByText('♋︎')).toBeInTheDocument();
    expect(screen.getByText(/July.*17|July 17/)).toBeInTheDocument();
    expect(screen.getByText('Cancer')).toBeInTheDocument();
  });

  it('clicking Close navigates to home', () => {
    useStore.setState({ screen: 'history' });
    render(<History />);
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(useStore.getState().screen).toBe('home');
  });
});

// ─── Settings ─────────────────────────────────────────────────────────────────

describe('Settings screen', () => {
  it('toggles push notifications setting from on to off', () => {
    useStore.setState({
      settings: { ntfyTopic: 'my-topic', ntfyEnabled: true, hapticFeedback: true },
    });
    render(<Settings />);
    fireEvent.click(screen.getByLabelText('Toggle push notifications'));
    expect(useStore.getState().settings.ntfyEnabled).toBe(false);
  });

  it('toggles haptic feedback setting from on to off', () => {
    useStore.setState({
      settings: { ntfyTopic: '', ntfyEnabled: true, hapticFeedback: true },
    });
    render(<Settings />);
    fireEvent.click(screen.getByLabelText('Toggle haptic feedback'));
    expect(useStore.getState().settings.hapticFeedback).toBe(false);
  });
});

// ─── ResultPeek ───────────────────────────────────────────────────────────────

describe('ResultPeek screen', () => {
  beforeEach(() => {
    useStore.setState({
      stealth: {
        phase: 'COMPUTED',
        anchorValue: 24,
        differenceValue: 10,
        lastAdded: 0,
        engineResult: { kind: 'ok', primary: CANCER_DATE, alternate: null },
        resolvedDate: CANCER_DATE,
      },
    });
  });

  it('renders sign symbol', () => {
    render(<ResultPeek />);
    expect(screen.getByText('♋︎')).toBeInTheDocument();
  });

  it('renders sign name', () => {
    render(<ResultPeek />);
    expect(screen.getAllByText('Cancer').length).toBeGreaterThan(0);
  });

  it('renders formatted date (e.g. "July 17")', () => {
    render(<ResultPeek />);
    expect(screen.getByText(/July.*17|July 17/)).toBeInTheDocument();
  });

  it('renders primary result action', () => {
    render(<ResultPeek />);
    expect(screen.getByText('Begin another reading')).toBeInTheDocument();
  });

  it('renders home action', () => {
    render(<ResultPeek />);
    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });

  it('clicking home action navigates to home', () => {
    render(<ResultPeek />);
    fireEvent.click(screen.getByText('Return Home'));
    expect(useStore.getState().screen).toBe('home');
  });

  it('clicking primary result action navigates to stealth', () => {
    render(<ResultPeek />);
    fireEvent.click(screen.getByText('Begin another reading'));
    expect(useStore.getState().screen).toBe('stealth');
  });

  it('shows fallback "Back" button when no resolved date', () => {
    useStore.setState({
      stealth: {
        ...CLEAN_STEALTH,
        resolvedDate: null,
        engineResult: null,
      },
    });
    render(<ResultPeek />);
    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});

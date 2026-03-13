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
import PracticeMode from './PracticeMode';
import ResultPeek from './ResultPeek';
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
  settings: { ntfyTopic: '', hapticFeedback: true },
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
  it('renders "Start Performance" button', () => {
    render(<Home />);
    expect(screen.getByText('Start Performance')).toBeInTheDocument();
  });

  it('renders "Practice" button', () => {
    render(<Home />);
    expect(screen.getByText('Practice')).toBeInTheDocument();
  });

  it('renders "History" nav button', () => {
    render(<Home />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('renders "Guide" nav button', () => {
    render(<Home />);
    expect(screen.getByText('Guide')).toBeInTheDocument();
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
    expect(screen.getByText('Last reading')).toBeInTheDocument();
    expect(screen.getByText(/Cancer/)).toBeInTheDocument();
    expect(screen.getByText(/July.*17|17.*July/)).toBeInTheDocument();
  });

  it('when ntfyTopic is empty, shows warning message', () => {
    render(<Home />);
    expect(
      screen.getByText(/ntfy topic not configured/i)
    ).toBeInTheDocument();
  });

  it('does not show ntfy warning when ntfyTopic is set', () => {
    useStore.setState({
      settings: { ntfyTopic: 'my-topic', hapticFeedback: true },
    });
    render(<Home />);
    expect(
      screen.queryByText(/ntfy topic not configured/i)
    ).not.toBeInTheDocument();
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
    expect(screen.getByText('♋')).toBeInTheDocument();
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

// ─── PracticeMode ─────────────────────────────────────────────────────────────

describe('PracticeMode screen', () => {
  it('renders "Target Date" label', () => {
    render(<PracticeMode />);
    expect(screen.getByText('Target Date')).toBeInTheDocument();
  });

  it('renders "Reveal Answer" button initially', () => {
    render(<PracticeMode />);
    expect(screen.getByText('Reveal Answer')).toBeInTheDocument();
  });

  it('after clicking "Reveal Answer", shows A and D labels', () => {
    render(<PracticeMode />);
    fireEvent.click(screen.getByText('Reveal Answer'));
    // A and D column headers appear
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('after clicking "Reveal Answer", shows the calculated result', () => {
    const { container } = render(<PracticeMode />);
    fireEvent.click(screen.getByText('Reveal Answer'));
    // The calculation steps appear — text is split across spans by JSX interpolation,
    // so check the container's full text content rather than a single element match.
    expect(container.textContent).toMatch(/A − D/);
    expect(container.textContent).toMatch(/\/ 2/);
  });

  it('clicking "Next Date" resets view (Reveal Answer reappears)', () => {
    render(<PracticeMode />);
    // Reveal first
    fireEvent.click(screen.getByText('Reveal Answer'));
    expect(screen.queryByText('Reveal Answer')).not.toBeInTheDocument();
    // Next date resets
    fireEvent.click(screen.getByText('Next Date'));
    expect(screen.getByText('Reveal Answer')).toBeInTheDocument();
  });

  it('renders "Next Date" button', () => {
    render(<PracticeMode />);
    expect(screen.getByText('Next Date')).toBeInTheDocument();
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
    expect(screen.getByText('♋')).toBeInTheDocument();
  });

  it('renders sign name', () => {
    render(<ResultPeek />);
    expect(screen.getByText('Cancer')).toBeInTheDocument();
  });

  it('renders formatted date (e.g. "July 17")', () => {
    render(<ResultPeek />);
    expect(screen.getByText(/July.*17|July 17/)).toBeInTheDocument();
  });

  it('renders "New Reading" button', () => {
    render(<ResultPeek />);
    expect(screen.getByText('New Reading')).toBeInTheDocument();
  });

  it('renders "Home" button', () => {
    render(<ResultPeek />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('clicking "Home" navigates to home', () => {
    render(<ResultPeek />);
    fireEvent.click(screen.getByText('Home'));
    expect(useStore.getState().screen).toBe('home');
  });

  it('clicking "New Reading" navigates to stealth', () => {
    render(<ResultPeek />);
    fireEvent.click(screen.getByText('New Reading'));
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

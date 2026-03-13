import { describe, it, expect } from 'vitest';
import { compute } from './singularis';

// ─── 1. All-dates round-trip ──────────────────────────────────────────────────

describe('exhaustive round-trip', () => {
  it('every valid calendar date round-trips correctly', () => {
    const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const failures: string[] = [];

    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= DAYS_IN_MONTH[month - 1]; day++) {
        const a = month + day;
        const d = Math.abs(month - day);

        // Dates where month+day < 5 (e.g. Jan 1, Jan 2, Jan 3, Feb 1, Feb 2,
        // Mar 1) have a < 5 and are structurally unreachable via the mentalism
        // protocol. The engine correctly rejects them. Skip them here.
        if (a < 5) continue;
        const result = compute(a, d);

        if (result.kind === 'error') {
          failures.push(`${month}/${day}: got error (${result.reason})`);
          continue;
        }

        if (result.kind === 'ok') {
          if (result.primary.month !== month || result.primary.day !== day) {
            failures.push(
              `${month}/${day}: got ${result.primary.month}/${result.primary.day}`
            );
          }
        }

        if (result.kind === 'ambiguous') {
          const hasOriginal =
            (result.primary.month === month && result.primary.day === day) ||
            (result.alternate.month === month && result.alternate.day === day);
          if (!hasOriginal) {
            failures.push(`${month}/${day}: ambiguous but neither option matches`);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });
});

// ─── 2. Sign boundary transitions ────────────────────────────────────────────

describe('sign boundary transitions via compute()', () => {
  // Each entry: [month, day, expectedSign]
  // We call compute(month+day, |month-day|) and verify the sign resolves correctly.
  // Dates already tested in engine.test.ts lookupSign suite are included here
  // as compute()-level tests, which are distinct in scope.
  const boundaries: Array<[number, number, string]> = [
    // Capricorn / Aquarius
    [1, 19, 'Capricorn'],
    [1, 20, 'Aquarius'],
    // Aquarius / Pisces
    [2, 18, 'Aquarius'],
    [2, 19, 'Pisces'],
    // Pisces / Aries
    [3, 20, 'Pisces'],
    [3, 21, 'Aries'],
    // Aries / Taurus
    [4, 19, 'Aries'],
    [4, 20, 'Taurus'],
    // Taurus / Gemini
    [5, 20, 'Taurus'],
    [5, 21, 'Gemini'],
    // Gemini / Cancer
    [6, 20, 'Gemini'],
    [6, 21, 'Cancer'],
    // Cancer / Leo
    [7, 22, 'Cancer'],
    [7, 23, 'Leo'],
    // Leo / Virgo
    [8, 22, 'Leo'],
    [8, 23, 'Virgo'],
    // Virgo / Libra
    [9, 22, 'Virgo'],
    [9, 23, 'Libra'],
    // Libra / Scorpio
    [10, 22, 'Libra'],
    [10, 23, 'Scorpio'],
    // Scorpio / Sagittarius
    [11, 21, 'Scorpio'],
    [11, 22, 'Sagittarius'],
    // Sagittarius / Capricorn
    [12, 21, 'Sagittarius'],
    [12, 22, 'Capricorn'],
  ];

  for (const [month, day, expectedSign] of boundaries) {
    it(`${month}/${day} → ${expectedSign} (via compute)`, () => {
      const a = month + day;
      const d = Math.abs(month - day);
      const result = compute(a, d);

      // The result must not be an error for a valid calendar date
      expect(result.kind).not.toBe('error');

      if (result.kind === 'ok') {
        expect(result.primary.sign.name).toBe(expectedSign);
      } else if (result.kind === 'ambiguous') {
        // For ambiguous results, the date matching the input should have the
        // expected sign. Find the option that matches (month, day).
        const matchesPrimary =
          result.primary.month === month && result.primary.day === day;
        const matchesAlternate =
          result.alternate.month === month && result.alternate.day === day;

        expect(matchesPrimary || matchesAlternate).toBe(true);

        if (matchesPrimary) {
          expect(result.primary.sign.name).toBe(expectedSign);
        } else {
          expect(result.alternate.sign.name).toBe(expectedSign);
        }
      }
    });
  }
});

// ─── 3. All ambiguous pairs — must have two distinct valid dates ──────────────

describe('all ambiguous results have two distinct valid dates', () => {
  it('every ambiguous result has two non-identical valid dates', () => {
    const failures: string[] = [];

    // Only A/D combos where both (a-d)/2 <= 12 and (a+d)/2 <= 12 can be ambiguous
    for (let a = 2; a <= 24; a++) {
      for (let d = 0; d <= a; d += 2) {
        const result = compute(a, d);
        if (result.kind === 'ambiguous') {
          const { primary, alternate } = result;

          if (primary.month === alternate.month && primary.day === alternate.day) {
            failures.push(`A=${a},D=${d}: primary and alternate are identical`);
          }

          if (primary.month < 1 || primary.month > 12 || primary.day < 1) {
            failures.push(`A=${a},D=${d}: primary has invalid month/day`);
          }

          if (alternate.month < 1 || alternate.month > 12 || alternate.day < 1) {
            failures.push(`A=${a},D=${d}: alternate has invalid month/day`);
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });
});

// ─── 4. Named cusp / edge-case dates via compute() ───────────────────────────

describe('named cusp and edge cases via compute()', () => {
  // Jan 19 — last day of Capricorn
  it('Jan 19 → Capricorn', () => {
    const result = compute(1 + 19, Math.abs(1 - 19));
    expect(result.kind).not.toBe('error');
    if (result.kind === 'ok') {
      expect(result.primary.sign.name).toBe('Capricorn');
    } else if (result.kind === 'ambiguous') {
      const signs = [result.primary.sign.name, result.alternate.sign.name];
      expect(signs).toContain('Capricorn');
    }
  });

  // Jan 20 — first day of Aquarius
  it('Jan 20 → Aquarius', () => {
    const result = compute(1 + 20, Math.abs(1 - 20));
    expect(result.kind).not.toBe('error');
    if (result.kind === 'ok') {
      expect(result.primary.sign.name).toBe('Aquarius');
    } else if (result.kind === 'ambiguous') {
      const signs = [result.primary.sign.name, result.alternate.sign.name];
      expect(signs).toContain('Aquarius');
    }
  });

  // Jun 20 — last day of Gemini
  it('Jun 20 → Gemini', () => {
    // a=26, d=14 → larger=20, smaller=6 → unambiguous (20>12), month=6, day=20
    const result = compute(6 + 20, Math.abs(6 - 20));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(6);
    expect(result.primary.day).toBe(20);
    expect(result.primary.sign.name).toBe('Gemini');
  });

  // Jun 21 — first day of Cancer
  it('Jun 21 → Cancer', () => {
    // a=27, d=15 → larger=21, smaller=6 → unambiguous, month=6, day=21
    const result = compute(6 + 21, Math.abs(6 - 21));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(6);
    expect(result.primary.day).toBe(21);
    expect(result.primary.sign.name).toBe('Cancer');
  });

  // Jul 22 — last day of Cancer
  it('Jul 22 → Cancer', () => {
    // a=29, d=15 → larger=22, smaller=7 → unambiguous, month=7, day=22
    const result = compute(7 + 22, Math.abs(7 - 22));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(7);
    expect(result.primary.day).toBe(22);
    expect(result.primary.sign.name).toBe('Cancer');
  });

  // Jul 23 — first day of Leo
  it('Jul 23 → Leo', () => {
    // a=30, d=16 → larger=23, smaller=7 → unambiguous, month=7, day=23
    const result = compute(7 + 23, Math.abs(7 - 23));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(7);
    expect(result.primary.day).toBe(23);
    expect(result.primary.sign.name).toBe('Leo');
  });

  // Dec 21 — last day of Sagittarius
  it('Dec 21 → Sagittarius', () => {
    // a=33, d=9 → larger=21, smaller=12 → unambiguous, month=12, day=21
    const result = compute(12 + 21, Math.abs(12 - 21));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(12);
    expect(result.primary.day).toBe(21);
    expect(result.primary.sign.name).toBe('Sagittarius');
  });

  // Dec 22 — first day of Capricorn (winter)
  it('Dec 22 → Capricorn', () => {
    // a=34, d=10 → larger=22, smaller=12 → unambiguous, month=12, day=22
    const result = compute(12 + 22, Math.abs(12 - 22));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(12);
    expect(result.primary.day).toBe(22);
    expect(result.primary.sign.name).toBe('Capricorn');
  });

  // Jan 1 — New Year's Day → Capricorn
  // Note: a = 1+1 = 2 is below the engine minimum of 5, so compute() returns
  // anchor_too_low. Jan 1 is not reachable via the mentalism protocol.
  it('Jan 1 → anchor_too_low (unreachable via protocol)', () => {
    const result = compute(1 + 1, Math.abs(1 - 1));
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('anchor_too_low');
  });

  // Mar 20 — last day of Pisces
  it('Mar 20 → Pisces', () => {
    // a=23, d=17 → larger=20, smaller=3 → unambiguous, month=3, day=20
    const result = compute(3 + 20, Math.abs(3 - 20));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(3);
    expect(result.primary.day).toBe(20);
    expect(result.primary.sign.name).toBe('Pisces');
  });

  // Mar 21 — first day of Aries
  it('Mar 21 → Aries', () => {
    // a=24, d=18 → larger=21, smaller=3 → unambiguous, month=3, day=21
    const result = compute(3 + 21, Math.abs(3 - 21));
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.month).toBe(3);
    expect(result.primary.day).toBe(21);
    expect(result.primary.sign.name).toBe('Aries');
  });
});

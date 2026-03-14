import { DAYS_IN_MONTH } from '../utils/constants';
import type { EngineResult, ResolvedDate } from '../utils/types';
import { lookupSign } from './starsigns';

function isValidDay(month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  return day <= DAYS_IN_MONTH[month - 1];
}

function makeResolved(day: number, month: number): ResolvedDate {
  return { day, month, sign: lookupSign(month, day) };
}

export function compute(a: number, d: number): EngineResult {
  if (a < 5) {
    return { kind: 'error', reason: 'anchor_too_low' };
  }

  if (d > a) {
    return { kind: 'error', reason: 'd_exceeds_a' };
  }

  if ((a - d) % 2 !== 0) {
    return { kind: 'error', reason: 'odd_difference' };
  }

  const smaller = (a - d) / 2;
  const larger = a - smaller;

  // D == 0: day and month are equal
  if (d === 0) {
    const val = smaller; // smaller === larger === a/2
    // Try both orientations — they're the same value
    if (!isValidDay(val, val)) {
      return { kind: 'error', reason: 'invalid_day' };
    }
    return { kind: 'ok', primary: makeResolved(val, val), alternate: null };
  }

  // One value > 12: that value is the day, other is the month
  if (larger > 12 && smaller >= 1 && smaller <= 12) {
    const day = larger;
    const month = smaller;
    if (!isValidDay(month, day)) {
      return { kind: 'error', reason: 'invalid_day' };
    }
    return { kind: 'ok', primary: makeResolved(day, month), alternate: null };
  }

  // Both <= 12: ambiguous — either could be day or month
  if (larger <= 12 && smaller >= 1) {
    // Interpretation A: larger = day, smaller = month
    const aValid = isValidDay(smaller, larger);
    // Interpretation B: smaller = day, larger = month
    const bValid = isValidDay(larger, smaller);

    if (aValid && bValid) {
      return {
        kind: 'ambiguous',
        primary: makeResolved(larger, smaller),
        alternate: makeResolved(smaller, larger),
      };
    }

    if (aValid) {
      return { kind: 'ok', primary: makeResolved(larger, smaller), alternate: null };
    }

    if (bValid) {
      return { kind: 'ok', primary: makeResolved(smaller, larger), alternate: null };
    }

    return { kind: 'error', reason: 'invalid_day' };
  }

  // smaller < 1 means month would be 0 or negative
  return { kind: 'error', reason: 'invalid_month' };
}

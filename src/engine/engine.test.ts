import { describe, it, expect } from 'vitest';
import { compute } from './singularis';
import { lookupSign } from './starsigns';

// ─── Reference test cases from SPEC.md ───────────────────────────────────────

describe('compute() — reference cases', () => {
  it('Jessica: A=24, D=10 → July 17, Cancer', () => {
    const result = compute(24, 10);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.day).toBe(17);
    expect(result.primary.month).toBe(7);
    expect(result.primary.sign.name).toBe('Cancer');
    expect(result.primary.sign.symbol).toBe('♋');
  });

  it('Christmas: A=37, D=13 → December 25, Capricorn', () => {
    const result = compute(37, 13);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.day).toBe(25);
    expect(result.primary.month).toBe(12);
    expect(result.primary.sign.name).toBe('Capricorn');
    expect(result.primary.sign.symbol).toBe('♑');
  });

  it('Leap baby: A=31, D=27 → February 29, Pisces', () => {
    const result = compute(31, 27);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.day).toBe(29);
    expect(result.primary.month).toBe(2);
    expect(result.primary.sign.name).toBe('Pisces');
    expect(result.primary.sign.symbol).toBe('♓');
  });

  it('NYE: A=43, D=19 → December 31, Capricorn', () => {
    const result = compute(43, 19);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.day).toBe(31);
    expect(result.primary.month).toBe(12);
    expect(result.primary.sign.name).toBe('Capricorn');
    expect(result.primary.sign.symbol).toBe('♑');
  });

  it('Same d/m: A=12, D=0 → June 6, Gemini', () => {
    const result = compute(12, 0);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.primary.day).toBe(6);
    expect(result.primary.month).toBe(6);
    expect(result.primary.sign.name).toBe('Gemini');
    expect(result.primary.sign.symbol).toBe('♊');
  });

  it('Ambiguous: A=13, D=3 → May 8 OR Aug 5 (Taurus/Leo)', () => {
    const result = compute(13, 3);
    expect(result.kind).toBe('ambiguous');
    if (result.kind !== 'ambiguous') return;

    const dates = [
      { day: result.primary.day, month: result.primary.month },
      { day: result.alternate.day, month: result.alternate.month },
    ];

    const hasMay8 = dates.some(d => d.day === 8 && d.month === 5);
    const hasAug5 = dates.some(d => d.day === 5 && d.month === 8);
    expect(hasMay8).toBe(true);
    expect(hasAug5).toBe(true);

    const signs = [result.primary.sign.name, result.alternate.sign.name];
    expect(signs).toContain('Taurus');
    expect(signs).toContain('Leo');
  });

  it('Too low: A=3, D=1 → ABORT (anchor_too_low)', () => {
    const result = compute(3, 1);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('anchor_too_low');
  });
});

// ─── Validation edge cases ────────────────────────────────────────────────────

describe('compute() — validation', () => {
  it('odd difference → error', () => {
    const result = compute(10, 3); // (10-3)=7 is odd
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('odd_difference');
  });

  it('D exceeds A → error', () => {
    const result = compute(10, 12);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('d_exceeds_a');
  });

  it('A at minimum boundary (5) → ok', () => {
    // A=5, D=1 → smaller=2, larger=3 → ambiguous(day=3,month=2 or day=2,month=3)
    const result = compute(5, 1);
    expect(result.kind).not.toBe('error');
  });

  it('A=4 → anchor_too_low', () => {
    const result = compute(4, 0);
    expect(result.kind).toBe('error');
    if (result.kind !== 'error') return;
    expect(result.reason).toBe('anchor_too_low');
  });

  it('A=43 (max) with D=19 → valid', () => {
    const result = compute(43, 19);
    expect(result.kind).toBe('ok');
  });
});

// ─── Star sign lookup ─────────────────────────────────────────────────────────

describe('lookupSign()', () => {
  const cases: Array<[number, number, string, string]> = [
    [1, 1,  'Capricorn',   '♑'],
    [1, 20, 'Aquarius',    '♒'],
    [2, 19, 'Pisces',      '♓'],
    [3, 21, 'Aries',       '♈'],
    [4, 20, 'Taurus',      '♉'],
    [5, 21, 'Gemini',      '♊'],
    [6, 21, 'Cancer',      '♋'],
    [7, 23, 'Leo',         '♌'],
    [8, 23, 'Virgo',       '♍'],
    [9, 23, 'Libra',       '♎'],
    [10, 23, 'Scorpio',    '♏'],
    [11, 22, 'Sagittarius','♐'],
    [12, 22, 'Capricorn',  '♑'],
    // boundary dates
    [7, 22, 'Cancer',      '♋'],
    [7, 17, 'Cancer',      '♋'],
    [12, 25, 'Capricorn',  '♑'],
    [12, 31, 'Capricorn',  '♑'],
    [6, 6,  'Gemini',      '♊'],
  ];

  for (const [month, day, name, symbol] of cases) {
    it(`month=${month}, day=${day} → ${name} ${symbol}`, () => {
      const sign = lookupSign(month, day);
      expect(sign.name).toBe(name);
      expect(sign.symbol).toBe(symbol);
    });
  }
});

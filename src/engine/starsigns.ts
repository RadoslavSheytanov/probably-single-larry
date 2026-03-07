import type { StarSign } from '../utils/types';

interface SignBoundary {
  sign: StarSign;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const BOUNDARIES: SignBoundary[] = [
  {
    sign: { name: 'Capricorn', symbol: '♑', element: 'Earth', dateRange: 'Dec 22 – Jan 19' },
    startMonth: 12, startDay: 22, endMonth: 12, endDay: 31,
  },
  {
    sign: { name: 'Capricorn', symbol: '♑', element: 'Earth', dateRange: 'Dec 22 – Jan 19' },
    startMonth: 1, startDay: 1, endMonth: 1, endDay: 19,
  },
  {
    sign: { name: 'Aquarius', symbol: '♒', element: 'Air', dateRange: 'Jan 20 – Feb 18' },
    startMonth: 1, startDay: 20, endMonth: 2, endDay: 18,
  },
  {
    sign: { name: 'Pisces', symbol: '♓', element: 'Water', dateRange: 'Feb 19 – Mar 20' },
    startMonth: 2, startDay: 19, endMonth: 3, endDay: 20,
  },
  {
    sign: { name: 'Aries', symbol: '♈', element: 'Fire', dateRange: 'Mar 21 – Apr 19' },
    startMonth: 3, startDay: 21, endMonth: 4, endDay: 19,
  },
  {
    sign: { name: 'Taurus', symbol: '♉', element: 'Earth', dateRange: 'Apr 20 – May 20' },
    startMonth: 4, startDay: 20, endMonth: 5, endDay: 20,
  },
  {
    sign: { name: 'Gemini', symbol: '♊', element: 'Air', dateRange: 'May 21 – Jun 20' },
    startMonth: 5, startDay: 21, endMonth: 6, endDay: 20,
  },
  {
    sign: { name: 'Cancer', symbol: '♋', element: 'Water', dateRange: 'Jun 21 – Jul 22' },
    startMonth: 6, startDay: 21, endMonth: 7, endDay: 22,
  },
  {
    sign: { name: 'Leo', symbol: '♌', element: 'Fire', dateRange: 'Jul 23 – Aug 22' },
    startMonth: 7, startDay: 23, endMonth: 8, endDay: 22,
  },
  {
    sign: { name: 'Virgo', symbol: '♍', element: 'Earth', dateRange: 'Aug 23 – Sep 22' },
    startMonth: 8, startDay: 23, endMonth: 9, endDay: 22,
  },
  {
    sign: { name: 'Libra', symbol: '♎', element: 'Air', dateRange: 'Sep 23 – Oct 22' },
    startMonth: 9, startDay: 23, endMonth: 10, endDay: 22,
  },
  {
    sign: { name: 'Scorpio', symbol: '♏', element: 'Water', dateRange: 'Oct 23 – Nov 21' },
    startMonth: 10, startDay: 23, endMonth: 11, endDay: 21,
  },
  {
    sign: { name: 'Sagittarius', symbol: '♐', element: 'Fire', dateRange: 'Nov 22 – Dec 21' },
    startMonth: 11, startDay: 22, endMonth: 12, endDay: 21,
  },
];

function dateToOrdinal(month: number, day: number): number {
  // Convert to a comparable number within a year (1 = Jan 1)
  const daysBeforeMonth = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return daysBeforeMonth[month] + day;
}

export function lookupSign(month: number, day: number): StarSign {
  const ordinal = dateToOrdinal(month, day);

  for (const boundary of BOUNDARIES) {
    const start = dateToOrdinal(boundary.startMonth, boundary.startDay);
    const end = dateToOrdinal(boundary.endMonth, boundary.endDay);

    if (start <= end) {
      if (ordinal >= start && ordinal <= end) return boundary.sign;
    } else {
      // wraps year boundary (Capricorn Dec 22 – Jan 19)
      if (ordinal >= start || ordinal <= end) return boundary.sign;
    }
  }

  // Fallback — should never reach here with valid input
  return BOUNDARIES[0].sign;
}

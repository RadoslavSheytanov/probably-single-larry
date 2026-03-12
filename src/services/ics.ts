import type { ResolvedDate } from '../utils/types';
import { MONTH_NAMES } from '../utils/constants';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function utcStamp(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

export function generateICS(date: ResolvedDate): string {
  const year = new Date().getFullYear();
  const { day, month, sign } = date;
  const mm = pad(month);
  const dd = pad(day);
  const monthName = MONTH_NAMES[month - 1];
  const uid = `singularis-${Date.now()}@prediction`;
  const dtstamp = utcStamp();
  const dtstart = `${year}${mm}${dd}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Singularis//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtstart}`,
    `SUMMARY:${sign.symbol} Prediction: ${monthName} ${day}`,
    `DESCRIPTION:Star Sign: ${sign.name} ${sign.symbol}\\nElement: ${sign.element}\\n\\nSingularis`,
    'STATUS:CONFIRMED',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(date: ResolvedDate): void {
  const content = generateICS(date);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prediction-${MONTH_NAMES[date.month - 1].toLowerCase()}-${date.day}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

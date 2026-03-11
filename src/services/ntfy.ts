import type { ResolvedDate } from '../utils/types';
import { MONTH_NAMES } from '../utils/constants';

function formatDate(date: ResolvedDate): string {
  return `${MONTH_NAMES[date.month - 1]} ${date.day}`;
}

export async function ntfySend(
  topic: string,
  primary: ResolvedDate,
  alternate: ResolvedDate | null,
): Promise<void> {
  if (!topic.trim()) return;

  const sign = primary.sign;
  const title = sign.name;
  const body = alternate
    ? `${sign.symbol} ${formatDate(primary)}  OR  ${formatDate(alternate)}`
    : `${sign.symbol} ${formatDate(primary)}`;

  try {
    await fetch(`https://ntfy.sh/${topic.trim()}`, {
      method: 'POST',
      headers: {
        Title: title,
        Priority: '2',
        Tags: 'crystal_ball',
      },
      body,
    });
  } catch {
    // Fail silently — offline or network error
  }
}

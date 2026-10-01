// Pure stats over the progress log (no DOM) so they're easy to test.
import { dayKey } from './progress.js';

export function activityByDay(attempts) {
  const days = {};
  for (const a of attempts) if (a.passed) days[dayKey(a.ts)] = (days[dayKey(a.ts)] ?? 0) + 1;
  return days;
}

const shift = (key, n) => {
  const d = new Date(key + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return dayKey(d.getTime());
};

// Current streak counts back from today, or from yesterday if today has no activity yet.
export function streaks(days, today = dayKey()) {
  let cur = 0;
  let d = days[today] ? today : shift(today, -1);
  while (days[d]) { cur++; d = shift(d, -1); }
  let best = 0, run = 0, prev = null;
  for (const k of Object.keys(days).sort()) {
    run = prev && shift(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { current: cur, longest: best };
}

// 53 week columns ending with the current week; each cell {key, count, level 0-4}.
export function heatmap(days, today = dayKey()) {
  const end = new Date(today + 'T12:00:00');
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - 52 * 7);
  const max = Math.max(1, ...Object.values(days));
  const cells = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = dayKey(d.getTime()), count = days[key] ?? 0;
    cells.push({ key, count, level: count && Math.min(4, Math.ceil((4 * count) / max)) });
  }
  return cells;
}

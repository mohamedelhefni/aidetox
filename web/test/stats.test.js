import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streaks, heatmap, activityByDay } from '../src/stats.js';

test('streaks: current counts through yesterday, longest spans gaps', () => {
  const days = { '2026-09-01': 1, '2026-09-02': 2, '2026-09-03': 1, '2026-09-20': 1, '2026-09-21': 1 };
  assert.deepEqual(streaks(days, '2026-09-22'), { current: 2, longest: 3 });
  assert.deepEqual(streaks(days, '2026-09-21'), { current: 2, longest: 3 });
  assert.deepEqual(streaks(days, '2026-09-24'), { current: 0, longest: 3 });
  assert.deepEqual(streaks({}, '2026-09-24'), { current: 0, longest: 0 });
});

test('heatmap: starts on a Sunday, ends today, scales levels', () => {
  const cells = heatmap({ '2026-09-24': 4, '2026-09-23': 1 }, '2026-09-24');
  assert.equal(new Date(cells[0].key + 'T12:00:00').getDay(), 0);
  assert.equal(cells.at(-1).key, '2026-09-24');
  assert.equal(cells.at(-1).level, 4);
  assert.equal(cells.at(-2).level, 1);
  assert.ok(cells.length > 52 * 7 && cells.length <= 53 * 7);
});

test('activityByDay counts passing attempts only', () => {
  const ts = new Date('2026-09-24T10:00:00').getTime();
  assert.deepEqual(activityByDay([{ ts, passed: true }, { ts, passed: false }, { ts, passed: true }]), { '2026-09-24': 2 });
});

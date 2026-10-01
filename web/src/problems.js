// The two in-browser tracks. Build-from-scratch days with a spec run in every language;
// the rest (goroutines, benchmarks, sockets) are Go-only and use the repo's own Go tests.
import { SPECS } from './specs.js';
import { TOOLKIT as KIT } from './toolkit.js';

const briefs = import.meta.glob('../../challenges/*.md', { query: '?raw', import: 'default', eager: true });

// Go-only days: the brief's **Files:** line names the file to edit and test locally.
const filesRe = /\*\*Files:\*\* `([^`]+)`/;

export const SCRATCH = Object.entries(briefs).map(([path, md]) => {
  const id = path.split('/').pop().replace('.md', '');
  const [, day, title] = md.match(/^# Day (\d+) — (.+)$/m);
  const timebox = md.match(/\*\*Timebox:\*\* ([^\n]+?)\s*$/m)?.[1] ?? '';
  const file = md.match(filesRe)?.[1];
  const spec = SPECS[id];
  return {
    id, track: 'scratch', label: `Build from scratch · Day ${day}`, day: +day, title, timebox, file,
    week: Math.ceil(+day / 5),
    ...(spec ? { ...spec, portable: true } : { brief: md.replace(/^# .*\n/, '').replace(/^\*\*Timebox:\*\*.*\n/m, ''), portable: false }),
  };
}).sort((a, b) => a.day - b.day);

export const TOOLKIT = KIT.map(p => ({ ...p, track: 'toolkit', label: `Engineer’s toolkit · #${p.n}`, day: p.n, portable: true }));

export const findProblem = id => SCRATCH.find(p => p.id === id) ?? TOOLKIT.find(p => p.id === id);

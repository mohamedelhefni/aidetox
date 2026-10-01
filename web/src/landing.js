// Landing page (what aidetox is + the plan), the profile page (stats + heatmap) and the track pages.
import { GRIND75 } from './grind75.js';
import { SCRATCH, TOOLKIT } from './problems.js';
import { progress } from './progress.js';
import { activityByDay, streaks, heatmap } from './stats.js';
import { LANGS } from './langs.js';
import { h, esc } from './dom.js';

const SCRATCH_WEEKS = ['Linear structures', 'Trees, heaps & sets', 'Graphs & caching', 'Concurrency', 'Parsing & encoding', 'Mini Redis'];
const TOOLKIT_WEEKS = ['Hashing & probabilistic', 'Advanced structures', 'Systems & text'];
const GRIND_WEEKS = ['Warm-up', 'Easy fundamentals', 'Mediums begin', 'Graphs & design', 'Backtracking & intervals', 'Dynamic programming', 'Two pointers & design', 'The hard ones'];

const byWeek = items => Object.values(Object.groupBy(items, p => p.week));
const done = items => items.filter(p => progress.isSolved(p.id)).length;
const bar = (n, total) => `<span class="bar" role="img" aria-label="${n} of ${total} done"><span style="width:${(100 * n) / total}%"></span></span>`;
const link = p => (p.track === 'grind75' ? '#/grind75' : `#/p/${p.id}`);

export function landingPage() {
  const page = h(`
    <div class="landing">
      <header class="hero">
        <p class="eyebrow">A detox program for software engineers</p>
        <h1>Code without<br>the copilot.</h1>
        <p class="lede">If you can’t write a linked list without autocomplete anymore, this is for you. aidetox is three tracks of practice with no AI and no autocomplete. You write the code and the tests tell you if it works.</p>
        <div class="cta">
          <a class="button primary" href="#/p/01-linked-list">Start day 1</a>
          <a class="button ghost" href="#/grind75">Grind 75 checklist</a>
        </div>
      </header>

      <section class="how">
        <h2>How it works</h2>
        <ol class="steps">
          <li><strong>Read the brief.</strong> Every build-from-scratch day comes with a fixed API and the edge cases to think about first.</li>
          <li><strong>Write it yourself.</strong> The editor has syntax highlighting, no autocomplete pop-ups and an optional vim mode. Turn on “Block paste” if you want to make yourself type every line. JavaScript, TypeScript, Python, Go or C++.</li>
          <li><strong>Run the tests in your browser.</strong> Python, Go and C++ compile to WebAssembly on your machine. Nothing is uploaded, and there’s no account.</li>
        </ol>
      </section>

      <section class="plan">
        <h2>The plan</h2>
        <p class="muted">Three tracks you can run side by side. The rules come from the challenge’s own playbook: code five days, rest two, and cap sessions at about 2.5 hours. Pseudocode is fine. Reading someone else’s implementation before you’ve tried is not.</p>
        <div class="tracks">
          <div>
            <h3><a href="#/scratch">Build from scratch</a> <span class="muted">· 6 weeks · 30 days</span></h3>
            <p class="small muted">Implement the data structures you normally import, then parsers, a storage engine, and finally a mini Redis. 25 days run in any language; the 5 about goroutines and benchmarks are Go-only.</p>
            <div class="weeks scratch-weeks"></div>
          </div>
          <div>
            <h3><a href="#/toolkit">Engineer’s toolkit</a> <span class="muted">· 3 weeks · 15 problems</span></h3>
            <p class="small muted">The structures behind real systems: Bloom filters, count-min sketch, HyperLogLog, consistent hashing, skip lists, circuit breakers, timing wheels, a regex engine and more. All run in any language.</p>
            <div class="weeks toolkit-weeks"></div>
          </div>
          <div>
            <h3><a href="#/grind75">Grind 75</a> <span class="muted">· 8 weeks · 75 problems</span></h3>
            <p class="small muted">The standard interview set from techinterviewhandbook.org. Solve each one on LeetCode with the AI assistant off, then mark it done here.</p>
            <div class="weeks grind-weeks"></div>
          </div>
        </div>
      </section>
    </div>`);

  const weekCards = (el, items, names) => byWeek(items).forEach((ps, i) => el.append(h(`
    <a class="week" href="${link(ps[0])}">
      <span class="small muted">Week ${i + 1}</span>
      <strong>${esc(names[i])}</strong>
      ${bar(done(ps), ps.length)}
      <span class="small muted">${done(ps)}/${ps.length}</span>
    </a>`)));
  weekCards(page.querySelector('.scratch-weeks'), SCRATCH, SCRATCH_WEEKS);
  weekCards(page.querySelector('.toolkit-weeks'), TOOLKIT, TOOLKIT_WEEKS);
  weekCards(page.querySelector('.grind-weeks'), GRIND75, GRIND_WEEKS);

  return page;
}

export function profilePage() {
  const page = h(`
    <div class="landing profile">
      <header class="page-head">
        <p class="eyebrow">Profile</p>
        <h1>Your progress</h1>
        <p class="lede">Everything here is stored in this browser only. There’s no account.</p>
      </header>
      <div class="stats"></div>
      <footer class="data">
        <p class="small muted">Export your progress to move devices or keep a backup.</p>
        <button class="ghost export">Export progress</button>
        <label class="button ghost">Import progress<input type="file" accept="application/json" hidden class="import"></label>
      </footer>
    </div>`);
  page.querySelector('.stats').append(statsBlock());
  page.querySelector('.export').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([progress.export()], { type: 'application/json' }));
    a.download = `aidetox-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  page.querySelector('.import').onchange = async e => {
    try {
      progress.import(await e.target.files[0].text());
      location.reload();
    } catch (err) {
      alert('Could not import: ' + err.message);
    }
  };
  return page;
}

function statsBlock() {
  const attempts = progress.attempts();
  const days = activityByDay(attempts);
  const { current, longest } = streaks(days);
  const solved = progress.solved();
  const g = GRIND75.filter(p => solved[p.id]);
  const s = SCRATCH.filter(p => solved[p.id]);
  const k = TOOLKIT.filter(p => solved[p.id]);
  const runs = attempts.filter(a => !a.id.startsWith('g75-'));
  const passRate = runs.length ? Math.round((100 * runs.filter(a => a.passed).length) / runs.length) : 0;
  const diff = d => [GRIND75.filter(p => p.difficulty === d && solved[p.id]).length, GRIND75.filter(p => p.difficulty === d).length];
  const langs = Object.entries(Object.groupBy([...s, ...k], p => solved[p.id].lang))
    .map(([l, ps]) => `<li><span>${esc(LANGS[l]?.label ?? l)}</span><strong>${ps.length}</strong></li>`).join('');

  const block = h(`
    <div>
      <div class="tiles">
        <div class="tile"><span class="muted small">Build from scratch</span><strong>${s.length}<small>/${SCRATCH.length}</small></strong>${bar(s.length, SCRATCH.length)}</div>
        <div class="tile"><span class="muted small">Engineer’s toolkit</span><strong>${k.length}<small>/${TOOLKIT.length}</small></strong>${bar(k.length, TOOLKIT.length)}</div>
        <div class="tile"><span class="muted small">Grind 75</span><strong>${g.length}<small>/75</small></strong>${bar(g.length, 75)}</div>
        <div class="tile"><span class="muted small">Current streak</span><strong>${current}<small> day${current === 1 ? '' : 's'}</small></strong><span class="muted small">Longest: ${longest}</span></div>
        <div class="tile"><span class="muted small">Test runs</span><strong>${runs.length}</strong><span class="muted small">${passRate}% all green</span></div>
      </div>
      <div class="heat-wrap"></div>
      <div class="breakdown">
        <div>
          <h3 class="small muted">Grind 75 by difficulty</h3>
          <ul class="diff">${['Easy', 'Medium', 'Hard'].map(d => { const [n, t] = diff(d); return `<li class="${d.toLowerCase()}"><span>${d}</span>${bar(n, t)}<span class="small">${n}/${t}</span></li>`; }).join('')}</ul>
        </div>
        <div>
          <h3 class="small muted">Solved in</h3>
          ${langs ? `<ul class="langs">${langs}</ul>` : '<p class="small muted">No languages yet. Pick one on any in-browser problem.</p>'}
        </div>
      </div>
    </div>`);
  block.querySelector('.heat-wrap').append(heatmapEl(days));
  return block;
}

function heatmapEl(days) {
  const cells = heatmap(days);
  const total = Object.values(days).reduce((a, b) => a + b, 0);
  // Label a column with a month name when that week contains the 1st.
  const months = [];
  for (let col = 0; col * 7 < cells.length; col++) {
    const first = cells.slice(col * 7, col * 7 + 7).find(c => c.key.endsWith('-01'));
    if (first) months.push(`<span style="grid-column:${col + 1}">${new Date(first.key + 'T12:00:00').toLocaleString('en', { month: 'short' })}</span>`);
  }
  return h(`
    <figure class="heatmap">
      <div class="heat-scroll">
        <div class="heat-months">${months.join('')}</div>
        <div class="heat-grid" role="img" aria-label="${total} solves in the last year">
          ${cells.map(c => `<i class="l${c.level}" title="${c.count} solve${c.count === 1 ? '' : 's'} on ${c.key}"></i>`).join('')}
        </div>
      </div>
      <figcaption class="small muted">
        <span>${total} solve${total === 1 ? '' : 's'} in the last year · passing test runs and Grind 75 check-offs</span>
        <span class="legend">Less <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> More</span>
      </figcaption>
    </figure>`);
}

export function grindPage() {
  const page = h(`
    <div class="track">
      <p class="eyebrow">Track</p>
      <h1>Grind 75</h1>
      <p class="lede">Solve each problem on LeetCode with Copilot or any AI assistant turned off, then come back and mark it done. Your streak and heatmap count it on the day you mark it.</p>
      <div class="list"></div>
    </div>`);
  byWeek(GRIND75).forEach((ps, i) => {
    const sec = h(`<section class="week-list"><h2>Week ${i + 1} <span class="muted">· ${esc(GRIND_WEEKS[i])} · ${ps.reduce((a, p) => a + p.minutes, 0)} min</span></h2><ul></ul></section>`);
    for (const p of ps) {
      const row = h(`
        <li class="row">
          <label class="check"><input type="checkbox" aria-label="Mark ${esc(p.title)} done"></label>
          <a href="${p.url}" target="_blank" rel="noopener noreferrer">${esc(p.title)} <span aria-hidden="true">↗</span></a>
          <span class="chip ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
          <span class="muted small">${p.minutes} min</span>
        </li>`);
      const box = row.querySelector('input');
      box.checked = progress.isSolved(p.id);
      row.classList.toggle('done', box.checked);
      box.onchange = () => {
        box.checked ? progress.record(p.id, 'leetcode', true) : progress.unmark(p.id);
        row.classList.toggle('done', box.checked);
      };
      sec.querySelector('ul').append(row);
    }
    page.querySelector('.list').append(sec);
  });
  return page;
}

// A list of problems grouped by week, used by the build-from-scratch and toolkit tracks.
function trackPage(title, lede, items, weekNames, chip) {
  const page = h(`
    <div class="track">
      <p class="eyebrow">Track</p>
      <h1>${esc(title)}</h1>
      <p class="lede">${esc(lede)}</p>
      <div class="list"></div>
    </div>`);
  byWeek(items).forEach((ps, i) => {
    const sec = h(`<section class="week-list"><h2>Week ${i + 1} <span class="muted">· ${esc(weekNames[i])}</span></h2><ul></ul></section>`);
    for (const p of ps) sec.querySelector('ul').append(h(`
      <li class="row ${progress.isSolved(p.id) ? 'done' : ''}">
        <span class="daynum">${progress.isSolved(p.id) ? '✓' : p.day}</span>
        <a href="#/p/${p.id}">${esc(p.title)}</a>
        <span class="chip">${chip(p)}</span>
        <span class="muted small">${esc(p.timebox)}</span>
      </li>`));
    page.querySelector('.list').append(sec);
  });
  return page;
}

const ANY = 'JS · TS · Py · Go · C++';

export const scratchPage = () =>
  trackPage('Build from scratch', 'Thirty days of implementing what you usually import. Five days on, two days off.', SCRATCH, SCRATCH_WEEKS, p => (p.portable ? ANY : 'Go · local'));

export const toolkitPage = () =>
  trackPage('Engineer’s toolkit', 'Fifteen structures and algorithms that show up in real systems — the ones that separate “I used Redis” from “I know how Redis works.”', TOOLKIT, TOOLKIT_WEEKS, () => ANY);

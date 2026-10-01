// A build-from-scratch problem: brief on the left, editor + test results on the right.
import { marked } from 'marked';
import { LANGS, parseOutput, check } from './langs.js';
import { run } from './runner.js';
import { createEditor } from './editor.js';
import { progress } from './progress.js';
import { h, esc } from './dom.js';

const fmt = v => JSON.stringify(v);

// Short readable description of one test, e.g. "LRUCache(2) → put(1, 1) → get(1)".
function describe(p, test) {
  if (p.kind === 'fn') return `${p.fn.name}(${test.args.map(fmt).join(', ')})`;
  return [`${p.class.name}(${test.ctor.map(fmt).join(', ')})`, ...test.calls.map(([m, a]) => `${m}(${a.map(fmt).join(', ')})`)].join(' → ');
}

function verdict(p, test, r) {
  if (!r) return { ok: false, why: 'Did not run — an earlier crash stopped the program.' };
  if (r.error) return { ok: false, why: r.error };
  if (check(p, test, r.got)) return { ok: true };
  if (p.kind === 'fn') {
    const hint = p.compare === 'topo' ? (test.expected.length ? ' (any valid order)' : ' (graph has a cycle)') : '';
    return { ok: false, why: `expected ${fmt(test.expected)}${hint}, got ${fmt(r.got)}` };
  }
  const k = test.expected.findIndex((e, i) => !check({}, { expected: e }, r.got?.[i]));
  const [m, a] = test.calls[k] ?? ['?', []];
  return { ok: false, why: `call ${k + 1}: ${m}(${a.map(fmt).join(', ')}) expected ${fmt(test.expected[k])}, got ${fmt(r.got?.[k])}` };
}

function testList(p) {
  return h(`<ol class="tests">${p.tests.map((t, i) => `<li><code>${esc(describe(p, t))}</code></li>`).join('')}</ol>`);
}

export function problemPage(p, { hasLocalRunner }) {
  const page = h(`
    <div class="problem">
      <article class="brief">
        <p class="eyebrow">${esc(p.label)} · ${esc(p.timebox)}</p>
        <h1>${esc(p.title)}</h1>
        <div class="md">${marked.parse(p.brief)}</div>
        ${p.portable ? '<h2>Tests</h2>' : ''}
      </article>
      <section class="workbench"></section>
    </div>`);
  if (p.portable) {
    page.querySelector('.brief').append(testList(p));
    page.querySelector('.workbench').append(portableBench(p));
  } else {
    page.querySelector('.workbench').append(goOnlyBench(p, hasLocalRunner));
  }
  return page;
}

function toolbar(langSelect) {
  return h(`
    <div class="toolbar">
      ${langSelect}
      <label class="toggle"><input type="checkbox" class="vim"> Vim</label>
      <label class="toggle" title="Paste and drag-and-drop into the editor are refused"><input type="checkbox" class="nopaste"> Block paste</label>
      <span class="grow"></span>
      <button class="ghost fullscreen" aria-pressed="false" title="Fill the window with the editor and results">⤢ Full screen</button>
      <button class="ghost reset">Reset</button>
      <button class="primary run">Run tests <kbd>⌘↵</kbd></button>
    </div>`);
}

// Vim/paste-blocking checkboxes (remembered across visits) and the full-screen button.
// Full screen is a CSS overlay rather than the Fullscreen API, whose Esc-to-exit fights vim.
function wireToggles(bar, getEditor, note, container) {
  const full = bar.querySelector('.fullscreen');
  full.onclick = () => {
    const on = container.classList.toggle('full');
    document.body.classList.toggle('no-scroll', on);
    full.setAttribute('aria-pressed', on);
    full.textContent = on ? '⤡ Exit full screen' : '⤢ Full screen';
    getEditor()?.focus();
  };
  const vimBox = bar.querySelector('.vim');
  vimBox.checked = progress.setting('vim', false);
  vimBox.onchange = () => { progress.setSetting('vim', vimBox.checked); getEditor()?.setVim(vimBox.checked); getEditor()?.focus(); };
  const pasteBox = bar.querySelector('.nopaste');
  const hint = () => {
    note.classList.remove('warn');
    note.textContent = pasteBox.checked ? 'Paste is blocked. Type it out.' : 'Tip: turn on “Block paste” to make yourself type it out.';
  };
  pasteBox.checked = progress.setting('blockPaste', false);
  pasteBox.onchange = () => { progress.setSetting('blockPaste', pasteBox.checked); getEditor()?.setBlockPaste(pasteBox.checked); hint(); };
  hint();
}

function portableBench(p) {
  let lang = progress.setting('lang', 'js');
  const starter = l => progress.draft(p.id, l) ?? LANGS[l].starter(p);
  const bench = h(`<div class="bench"></div>`);
  const bar = toolbar(`<select class="lang" aria-label="Language">${Object.entries(LANGS).map(([k, L]) => `<option value="${k}">${L.label}</option>`).join('')}</select>`);
  const host = h(`<div class="editor"></div>`);
  const note = h(`<p class="note"></p>`);
  const out = h(`<div class="results" aria-live="polite"></div>`);
  bench.append(bar, host, note, out);

  const ed = createEditor(host, {
    doc: starter(lang), lang,
    vimMode: progress.setting('vim', false),
    blockPaste: progress.setting('blockPaste', false),
    onChange: code => progress.setDraft(p.id, lang, code),
    onRun: () => runTests(),
    onPasteBlocked: () => { note.textContent = 'Paste is blocked — write it yourself (or untick “Block paste”).'; note.classList.add('warn'); },
  });
  wireToggles(bar, () => ed, note, bench);

  const sel = bar.querySelector('.lang');
  sel.value = lang;
  sel.onchange = () => { lang = sel.value; progress.setSetting('lang', lang); ed.setDoc(starter(lang), lang); out.replaceChildren(); };
  bar.querySelector('.reset').onclick = () => {
    if (!confirm(`Throw away your ${LANGS[lang].label} code and restore the starter?`)) return;
    progress.clearDraft(p.id, lang);
    ed.setDoc(LANGS[lang].starter(p), lang);
  };
  const btn = bar.querySelector('.run');
  btn.onclick = () => runTests();

  async function runTests() {
    if (btn.disabled) return;
    btn.disabled = true;
    const status = h(`<p class="status">Starting…</p>`);
    out.replaceChildren(status);
    const code = ed.view.state.doc.toString();
    const res = await run(p, lang, code, text => (status.textContent = text));
    btn.disabled = false;

    if (res.timeout) return out.replaceChildren(h(`<div class="banner fail"><strong>Time limit exceeded.</strong> Your code ran for over 10 s — look for an infinite loop.</div>`));
    if (res.compileError != null) return out.replaceChildren(h(`<div class="banner fail"><strong>Didn’t compile.</strong></div>`), h(`<pre class="log">${esc(res.compileError)}</pre>`));

    const { results, stdout } = parseOutput(res.output, p.tests.length);
    const vs = p.tests.map((t, i) => verdict(p, t, results[i]));
    const passed = vs.filter(v => v.ok).length;
    const all = passed === vs.length;
    const firstSolve = all && !progress.isSolved(p.id);
    progress.record(p.id, lang, all);
    out.replaceChildren(
      h(`<div class="banner ${all ? 'pass' : 'fail'}"><strong>${passed}/${vs.length} tests passed.</strong> ${all ? (firstSolve ? 'Solved — no copilot needed.' : 'Still passing.') : ''}</div>`),
      h(`<ol class="verdicts">${vs.map((v, i) => `
        <li class="${v.ok ? 'ok' : 'bad'}">
          <span class="mark">${v.ok ? '✓' : '✗'}</span>
          <div><code>${esc(describe(p, p.tests[i]))}</code>${v.ok ? '' : `<pre>${esc(v.why)}</pre>`}</div>
        </li>`).join('')}</ol>`),
      ...(stdout ? [h(`<details open><summary>Your output</summary><pre class="log">${esc(stdout)}</pre></details>`)] : []),
    );
  }
  return bench;
}

// Days that need goroutines, sockets or files: run the repo's real Go tests via `go run ./cmd/aidetox`.
function goOnlyBench(p, hasLocalRunner) {
  const pkg = p.file.split('/').slice(0, -1).join('/');
  const bench = h(`
    <div class="bench">
      <div class="banner info">
        <strong>Go-only day.</strong> It needs goroutines, sockets or files, so it runs against the repo’s real Go tests on your machine.
      </div>
      <pre class="log">git clone &lt;this repo&gt; &amp;&amp; cd &lt;repo&gt;
go test ./${esc(pkg)}          # edit ${esc(p.file)}
go run ./cmd/aidetox       # or: this site + a local runner</pre>
      <div class="toolbar"><span class="grow"></span><button class="ghost mark-done"></button></div>
    </div>`);
  const mark = bench.querySelector('.mark-done');
  const label = () => (mark.textContent = progress.isSolved(p.id) ? '✓ Done — undo' : 'Mark done');
  label();
  mark.onclick = () => { progress.isSolved(p.id) ? progress.unmark(p.id) : progress.record(p.id, 'go', true); label(); };
  if (hasLocalRunner) bench.append(localRunner(p));
  return bench;
}

function localRunner(p) {
  const box = h(`<div><p class="note">Local runner detected — edits run <code>go test</code> on your machine without touching the repo.</p></div>`);
  const bar = toolbar('<span class="pill">Go</span>');
  const host = h(`<div class="editor"></div>`);
  const note = h(`<p class="note"></p>`);
  const out = h(`<div class="results" aria-live="polite"></div>`);
  box.append(bar, host, note, out);
  let ed;
  wireToggles(bar, () => ed, note, box);
  fetch('api/challenges').then(r => r.json()).then(cs => {
    const c = cs.find(c => c.file === p.file);
    ed = createEditor(host, {
      doc: progress.draft(p.id, 'go-local') ?? c?.starter ?? '', lang: 'go',
      vimMode: progress.setting('vim', false),
      blockPaste: progress.setting('blockPaste', false),
      onChange: code => progress.setDraft(p.id, 'go-local', code),
      onRun: () => btn.click(),
      onPasteBlocked: () => { note.textContent = 'Paste is blocked.'; note.classList.add('warn'); },
    });
  });
  bar.querySelector('.reset').remove();
  const btn = bar.querySelector('.run');
  btn.onclick = async () => {
    btn.disabled = true;
    out.replaceChildren(h(`<p class="status">Running go test…</p>`));
    try {
      const res = await fetch('api/run', { method: 'POST', body: JSON.stringify({ file: p.file, drafts: { [p.file]: ed.view.state.doc.toString() } }) });
      if (!res.ok) throw new Error(await res.text());
      const { passed, output } = await res.json();
      progress.record(p.id, 'go', passed);
      out.replaceChildren(h(`<div class="banner ${passed ? 'pass' : 'fail'}"><strong>${passed ? 'All Go tests pass.' : 'Tests failed.'}</strong></div>`), h(`<pre class="log">${esc(output)}</pre>`));
    } catch (e) {
      out.replaceChildren(h(`<div class="banner fail">${esc(e.message)}</div>`));
    } finally {
      btn.disabled = false;
    }
  };
  return box;
}

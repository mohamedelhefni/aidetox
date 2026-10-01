// Runs reference solutions through the generated harnesses:
// - JS: every problem (validates the expected values in specs.js)
// - Python (python3), C++ (native clang++), Go (the site's Yaegi WASM): a few problems covering
//   class ops, arrays, strings, fn problems and a crashing solution.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transform } from 'sucrase';
import { SPECS } from '../src/specs.js';
import { TOOLKIT } from '../src/toolkit.js';
import { LANGS, parseOutput, check } from '../src/langs.js';
import { JS, PY, CPP, GO } from './solutions.js';

const ALL = { ...SPECS, ...Object.fromEntries(TOOLKIT.map(p => [p.id, p])) };
const problem = id => ({ id, ...ALL[id] });

function verdicts(p, output) {
  const { results } = parseOutput(output, p.tests.length);
  return results.map((r, i) => (r && 'got' in r && check(p, p.tests[i], r.got) ? 'pass' : r?.error ? 'error' : 'fail'));
}

function runJS(src) {
  const out = [];
  const log = console.log;
  console.log = (...a) => out.push(a.join(' '));
  try { new Function(src)(); } finally { console.log = log; }
  return out.join('\n');
}

for (const id of Object.keys(ALL)) {
  test(`js reference passes ${id}`, () => {
    const p = problem(id);
    assert.ok(JS[id], `missing reference solution for ${id}`);
    const v = verdicts(p, runJS(LANGS.js.harness(p, JS[id])));
    assert.deepEqual(v, v.map(() => 'pass'), v.map((x, i) => `${i}:${x}`).join(' '));
  });
}

test('starters compile-shape: every language produces a starter for every problem', () => {
  for (const id of Object.keys(ALL)) for (const L of Object.values(LANGS)) assert.ok(L.starter(problem(id)).length > 10);
});

const dir = mkdtempSync(join(tmpdir(), 'aidetox-'));


test('python harness', () => {
  for (const [id, code] of Object.entries(PY)) {
    const p = problem(id);
    const f = join(dir, 'main.py');
    writeFileSync(f, LANGS.python.harness(p, code));
    const v = verdicts(p, execFileSync('python3', [f], { encoding: 'utf8' }));
    assert.deepEqual(v, v.map(() => 'pass'), id);
  }
});


test('c++ harness (native clang++, same source the browser compiles)', () => {
  for (const [id, code] of Object.entries(CPP)) {
    const p = problem(id);
    writeFileSync(join(dir, 'main.cc'), LANGS.cpp.harness(p, code));
    execFileSync('clang++', ['-std=c++20', '-fno-exceptions', '-o', join(dir, 'a.out'), join(dir, 'main.cc')]);
    const v = verdicts(p, execFileSync(join(dir, 'a.out'), { encoding: 'utf8' }));
    assert.deepEqual(v, v.map(() => 'pass'), id);
  }
});


test('go harness (Yaegi WASM, as in the browser)', async () => {
  const wasm = new URL('../public/yaegi.wasm', import.meta.url);
  await import(new URL('../public/wasm_exec.js', import.meta.url));
  const go = new globalThis.Go();
  const { instance } = await WebAssembly.instantiate(readFileSync(wasm), go.importObject);
  go.run(instance);
  for (const [id, code] of Object.entries(GO)) {
    const p = problem(id);
    const v = verdicts(p, globalThis.runGo(code, LANGS.go.harness(p), '__run()'));
    assert.deepEqual(v, v.map(() => 'pass'), id);
  }
  // A panicking solution is reported per test instead of killing the run.
  const p = problem('07-heap');
  const v = verdicts(p, globalThis.runGo(LANGS.go.starter(p), LANGS.go.harness(p), '__run()'));
  assert.deepEqual(v, v.map(() => 'error'));
});

test('every starter + harness compiles in C++ and Go (users start from these)', async () => {
  const ids = Object.keys(ALL);
  for (const id of ids) {
    const p = problem(id);
    writeFileSync(join(dir, 'starter.cc'), LANGS.cpp.harness(p, LANGS.cpp.starter(p)));
    execFileSync('clang++', ['-std=c++20', '-fno-exceptions', '-fsyntax-only', join(dir, 'starter.cc')]);
    writeFileSync(join(dir, 'starter.py'), LANGS.python.starter(p));
    execFileSync('python3', ['-m', 'py_compile', join(dir, 'starter.py')]);
    new Function(LANGS.js.starter(p)); // syntax check only
    new Function(transform(LANGS.ts.starter(p), { transforms: ['typescript'] }).code);
    const out = globalThis.runGo(LANGS.go.starter(p), LANGS.go.harness(p), '__run()');
    assert.ok(!out.includes('@@CE'), `${id} go starter: ${out}`);
  }
});

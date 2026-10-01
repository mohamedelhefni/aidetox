// Runs generated harness code in a per-language Web Worker. Workers stay warm between runs
// (engines load once) and are killed if a run exceeds the time limit.
import { LANGS } from './langs.js';

const TIME_LIMIT_MS = 10_000;
const make = {
  js: () => new Worker(new URL('./workers/js.worker.js', import.meta.url), { type: 'module' }),
  python: () => new Worker(new URL('./workers/python.worker.js', import.meta.url), { type: 'module' }),
  go: () => new Worker(new URL('./workers/go.worker.js', import.meta.url), { type: 'module' }),
  cpp: () => new Worker(new URL('./workers/cpp.worker.js', import.meta.url), { type: 'module' }),
};
make.ts = make.js;
const workers = {};

// run(problem, lang, code, onStatus) -> Promise<{ output } | { compileError } | { timeout }>
export function run(problem, lang, code, onStatus) {
  const L = LANGS[lang];
  // Go is evaluated as two chunks so the harness can add its own imports.
  const src = lang === 'go' ? [code, L.harness(problem)] : L.harness(problem, code);
  const key = lang === 'ts' ? 'js' : lang;
  const w = (workers[key] ??= make[key]());

  return new Promise(resolve => {
    let timer;
    const finish = r => { clearTimeout(timer); w.onmessage = w.onerror = null; resolve(r); };
    w.onerror = e => { delete workers[key]; w.terminate(); finish({ compileError: 'Runner failed: ' + (e.message || 'could not load engine') }); };
    w.onmessage = ({ data }) => {
      if (data.type === 'status') onStatus(data.text);
      if (data.type === 'running') {
        onStatus('Running tests…');
        // The limit covers only execution, not the one-time engine download.
        timer = setTimeout(() => { w.terminate(); delete workers[key]; finish({ timeout: true }); }, TIME_LIMIT_MS);
      }
      if (data.type === 'done') {
        const i = data.output.indexOf('@@CE');
        finish(i >= 0 ? { compileError: data.output.slice(i + 5).trim() } : { output: data.output });
      }
    };
    w.postMessage({ lang, src, base: new URL(import.meta.env.BASE_URL, location.href).href });
  });
}

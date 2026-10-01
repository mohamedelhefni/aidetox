// Runs Python harnesses with Pyodide (CPython on WASM), loaded from the CDN on first use.
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/';
let py;

onmessage = async ({ data: { src } }) => {
  if (!py) {
    postMessage({ type: 'status', text: 'Loading Python (~10 MB, cached after the first time)…' });
    const { loadPyodide } = await import(/* @vite-ignore */ PYODIDE + 'pyodide.mjs');
    py = await loadPyodide({ indexURL: PYODIDE });
  }
  const out = [];
  py.setStdout({ batched: s => out.push(s) });
  py.setStderr({ batched: s => out.push(s) });
  const globals = py.globals.get('dict')(); // fresh namespace per run
  postMessage({ type: 'running' });
  try {
    py.runPython(src, { globals });
  } catch (e) {
    out.push('@@CE ' + e.message);
  } finally {
    globals.destroy();
  }
  postMessage({ type: 'done', output: out.join('\n') });
};

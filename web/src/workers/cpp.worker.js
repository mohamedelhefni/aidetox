// Compiles C++ with clang/lld on WASM (loaded from the CDN), then runs the WASI binary.
import { WASI, File, OpenFile, ConsoleStdout } from '@bjorn3/browser_wasi_shim';

const CLANG = 'https://cdn.jsdelivr.net/npm/@yowasp/clang@22.0.0-git20542-10/gen/bundle.js';
let clang;

onmessage = async ({ data: { src } }) => {
  if (!clang) {
    postMessage({ type: 'status', text: 'Loading C++ compiler (~27 MB, cached after the first time)…' });
    ({ runClang: clang } = await import(/* @vite-ignore */ CLANG));
  }
  const out = [];
  const errs = [];
  const dec = new TextDecoder();
  postMessage({ type: 'status', text: 'Compiling…' });
  let bin;
  try {
    const files = await clang(['clang++', '-std=c++20', '-O1', '-fno-exceptions', 'main.cc', '-o', 'a.out'], { 'main.cc': src }, {
      stdout: b => b && errs.push(dec.decode(b)),
      stderr: b => b && errs.push(dec.decode(b)),
      decodeASCII: false,
      fetchProgress: ({ totalLength, doneLength }) =>
        postMessage({ type: 'status', text: `Loading C++ compiler… ${Math.round((100 * doneLength) / totalLength)}%` }),
    });
    bin = files['a.out'];
  } catch {
    postMessage({ type: 'done', output: '@@CE ' + errs.join('') });
    return;
  }
  postMessage({ type: 'running' });
  const line = s => out.push(s);
  const wasi = new WASI([], [], [new OpenFile(new File([])), ConsoleStdout.lineBuffered(line), ConsoleStdout.lineBuffered(line)]);
  try {
    const { instance } = await WebAssembly.instantiate(bin, { wasi_snapshot_preview1: wasi.wasiImport });
    wasi.start(instance);
  } catch (e) {
    out.push('crashed: ' + e.message);
  }
  postMessage({ type: 'done', output: out.join('\n') });
};

// Runs Go with the Yaegi interpreter compiled to WASM (built by `npm run go:wasm`).
let ready;

function load(base) {
  return (ready ??= (async () => {
    postMessage({ type: 'status', text: 'Loading Go (~8 MB, cached after the first time)…' });
    await import(/* @vite-ignore */ base + 'wasm_exec.js');
    const go = new Go();
    // Split into 16 MB parts (Cloudflare caps assets at 25 MiB); 3 parts covers up to 48 MB.
    const parts = await Promise.all(['aa', 'ab', 'ac'].map(async (s) => (await fetch(base + 'yaegi.wasm.' + s)).blob()));
    const { instance } = await WebAssembly.instantiate(await new Blob(parts).arrayBuffer(), go.importObject);
    go.run(instance); // registers globalThis.runGo, then blocks forever inside WASM
  })());
}

onmessage = async ({ data: { src, base } }) => {
  await load(base);
  postMessage({ type: 'running' });
  // src = [user code, harness]; runGo evaluates chunks in one interpreter.
  const output = globalThis.runGo(src[0], src[1], '__run()');
  postMessage({ type: 'done', output });
};

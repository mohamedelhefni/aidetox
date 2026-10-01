import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // works from any subpath (e.g. GitHub Pages /repo/)
  server: {
    fs: { allow: ['..'] }, // briefs are read from ../challenges
    proxy: { '/api': 'http://127.0.0.1:8080' }, // local Go runner, if running
  },
  worker: { format: 'es' },
  // Worker-only deps; pre-bundle so the dev server doesn't reload mid-run when they're first used.
  optimizeDeps: { include: ['sucrase', '@bjorn3/browser_wasi_shim'] },
  // CodeMirror breaks if two copies of its core load (instanceof checks).
  resolve: { dedupe: ['@codemirror/state', '@codemirror/view', '@codemirror/language', '@codemirror/autocomplete', '@codemirror/commands', '@codemirror/search', '@codemirror/lint', '@lezer/common', '@lezer/highlight', '@lezer/lr'] },
});

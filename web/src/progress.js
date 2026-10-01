// Everything the site remembers lives in this browser's localStorage under one key.
// Reads/writes are wrapped because storage can be unavailable (private mode, blocked site data).
const KEY = 'aidetox:v1';
const empty = () => ({ attempts: [], solved: {}, drafts: {}, settings: {} });

function load() {
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return empty(); }
}
let state = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const dayKey = (ts = Date.now()) => new Date(ts).toLocaleDateString('en-CA'); // YYYY-MM-DD, local time

export const progress = {
  isSolved: id => !!state.solved[id],
  solved: () => state.solved,
  attempts: () => state.attempts,

  // passed=true records a solve; failing runs are kept for the stats page too.
  record(id, lang, passed) {
    // ponytail: capped log, 10k attempts is years of daily practice.
    state.attempts = [...state.attempts, { id, lang, ts: Date.now(), passed }].slice(-10_000);
    if (passed && !state.solved[id]) state.solved[id] = { lang, ts: Date.now() };
    save();
  },
  unmark(id) { delete state.solved[id]; save(); },

  draft: (id, lang) => state.drafts[`${id}:${lang}`],
  setDraft(id, lang, code) { state.drafts[`${id}:${lang}`] = code; save(); },
  clearDraft(id, lang) { delete state.drafts[`${id}:${lang}`]; save(); },

  setting: (k, fallback) => state.settings[k] ?? fallback,
  setSetting(k, v) { state.settings[k] = v; save(); },

  export: () => JSON.stringify(state, null, 2),
  import(text) {
    const s = JSON.parse(text);
    if (!s || !Array.isArray(s.attempts) || typeof s.solved !== 'object') throw new Error('Not an aidetox progress file');
    state = { ...empty(), ...s };
    save();
  },
};

// Reference solutions used only by the tests (and for manual browser checks) to validate specs.js. Never shipped to the site.
export const JS = {
  '01-linked-list': `class LinkedList {
  constructor() { this.h = null; this.t = null; this.n = 0; }
  link(nd, before) { // insert nd before 'before' (null = at tail)
    nd.next = before; nd.prev = before ? before.prev : this.t;
    if (nd.prev) nd.prev.next = nd; else this.h = nd;
    if (before) before.prev = nd; else this.t = nd;
    this.n++;
  }
  unlink(nd) {
    if (nd.prev) nd.prev.next = nd.next; else this.h = nd.next;
    if (nd.next) nd.next.prev = nd.prev; else this.t = nd.prev;
    this.n--; return nd.v;
  }
  find(v) { let c = this.h; while (c && c.v !== v) c = c.next; return c; }
  pushFront(v) { this.link({ v }, this.h); }
  pushBack(v) { this.link({ v }, null); }
  popFront() { return this.h ? this.unlink(this.h) : -1; }
  popBack() { return this.t ? this.unlink(this.t) : -1; }
  front() { return this.h ? this.h.v : -1; }
  back() { return this.t ? this.t.v : -1; }
  remove(v) { const c = this.find(v); if (!c) return false; this.unlink(c); return true; }
  moveToFront(v) { const c = this.find(v); if (!c) return false; this.unlink(c); this.link(c, this.h); return true; }
  moveToBack(v) { const c = this.find(v); if (!c) return false; this.unlink(c); this.link(c, null); return true; }
  size() { return this.n; }
  toArray() { const r = []; for (let c = this.h; c; c = c.next) r.push(c.v); return r; }
}`,
  '02-ring-buffer': `class RingBuffer {
  constructor(c) { this.a = new Array(c); this.c = c; this.h = 0; this.n = 0; }
  push(v) { if (this.n === this.c) return false; this.a[(this.h + this.n) % this.c] = v; this.n++; return true; }
  pop() { if (!this.n) return -1; const v = this.a[this.h]; this.h = (this.h + 1) % this.c; this.n--; return v; }
  peek() { return this.n ? this.a[this.h] : -1; }
  size() { return this.n; } capacity() { return this.c; }
  isFull() { return this.n === this.c; } isEmpty() { return this.n === 0; }
}`,
  '03-dynamic-array': `class DynamicArray {
  constructor() { this.a = []; this.c = 0; this.n = 0; }
  grow() { if (this.n === this.c) this.c = Math.max(1, 2 * this.c); }
  append(v) { this.grow(); this.a[this.n++] = v; }
  ok(i) { return i >= 0 && i < this.n; }
  get(i) { return this.ok(i) ? this.a[i] : -1; }
  set(i, v) { if (!this.ok(i)) return false; this.a[i] = v; return true; }
  insert(i, v) { if (i < 0 || i > this.n) return false; this.grow(); for (let k = this.n; k > i; k--) this.a[k] = this.a[k - 1]; this.a[i] = v; this.n++; return true; }
  removeAt(i) { if (!this.ok(i)) return false; for (let k = i; k < this.n - 1; k++) this.a[k] = this.a[k + 1]; this.n--; return true; }
  size() { return this.n; } capacity() { return this.c; }
  toArray() { return this.a.slice(0, this.n); }
}`,
  '04-hash-table': `class HashTable {
  constructor() { this.b = Array.from({ length: 8 }, () => []); this.n = 0; }
  idx(k, len = this.b.length) { let h = 2166136261; for (const ch of k) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h % len; }
  set(k, v) {
    const b = this.b[this.idx(k)], e = b.find(e => e[0] === k);
    if (e) { e[1] = v; return; }
    b.push([k, v]); this.n++;
    if (this.n / this.b.length > 0.75) { const old = this.b.flat(); this.b = Array.from({ length: this.b.length * 2 }, () => []); for (const e of old) this.b[this.idx(e[0])].push(e); }
  }
  get(k) { const e = this.b[this.idx(k)].find(e => e[0] === k); return e ? e[1] : ''; }
  remove(k) { const b = this.b[this.idx(k)], i = b.findIndex(e => e[0] === k); if (i < 0) return false; b.splice(i, 1); this.n--; return true; }
  contains(k) { return this.b[this.idx(k)].some(e => e[0] === k); }
  size() { return this.n; }
}`,
  '06-bst': `class BST {
  constructor() { this.r = null; }
  insert(v) { const go = n => { if (!n) return [{ v, l: null, r: null }, true]; if (v === n.v) return [n, false]; const s = v < n.v ? 'l' : 'r'; const [c, ok] = go(n[s]); n[s] = c; return [n, ok]; }; const [r, ok] = go(this.r); this.r = r; return ok; }
  contains(v) { let n = this.r; while (n) { if (v === n.v) return true; n = v < n.v ? n.l : n.r; } return false; }
  remove(v) {
    let found = false;
    const del = (n, v) => {
      if (!n) return null;
      if (v < n.v) n.l = del(n.l, v); else if (v > n.v) n.r = del(n.r, v);
      else { found = true; if (!n.l) return n.r; if (!n.r) return n.l; let s = n.r; while (s.l) s = s.l; n.v = s.v; n.r = del(n.r, s.v); }
      return n;
    };
    this.r = del(this.r, v); return found;
  }
  min() { let n = this.r; if (!n) return -1; while (n.l) n = n.l; return n.v; }
  max() { let n = this.r; if (!n) return -1; while (n.r) n = n.r; return n.v; }
  walk(order) { const out = []; const go = n => { if (!n) return; if (order === 'pre') out.push(n.v); go(n.l); if (order === 'in') out.push(n.v); go(n.r); if (order === 'post') out.push(n.v); }; go(this.r); return out; }
  inOrder() { return this.walk('in'); } preOrder() { return this.walk('pre'); } postOrder() { return this.walk('post'); }
}`,
  '07-heap': `class MinHeap {
  constructor() { this.a = []; }
  push(v) { const a = this.a; a.push(v); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p] <= a[i]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() {
    const a = this.a; if (!a.length) return -1; const top = a[0], last = a.pop();
    if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l] < a[m]) m = l; if (r < a.length && a[r] < a[m]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } }
    return top;
  }
  peek() { return this.a.length ? this.a[0] : -1; }
  size() { return this.a.length; }
}`,
  '08-priority-queue': `class PriorityQueue {
  constructor() { this.a = []; this.seq = 0; }
  enqueue(name, p) { this.a.push([p, this.seq++, name]); }
  best() { let b = -1; this.a.forEach((x, i) => { if (b < 0 || x[0] < this.a[b][0] || (x[0] === this.a[b][0] && x[1] < this.a[b][1])) b = i; }); return b; }
  dequeue() { const b = this.best(); return b < 0 ? '' : this.a.splice(b, 1)[0][2]; }
  peek() { const b = this.best(); return b < 0 ? '' : this.a[b][2]; }
  size() { return this.a.length; }
}`,
  '09-trie': `class Trie {
  constructor() { this.w = new Set(); }
  insert(w) { this.w.add(w); }
  contains(w) { return this.w.has(w); }
  startsWith(p) { return [...this.w].some(x => x.startsWith(p)); }
  remove(w) { return this.w.delete(w); }
  wordsWithPrefix(p) { return [...this.w].filter(x => x.startsWith(p)).sort(); }
}`,
  '10-union-find': `class UnionFind {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); this.c = n; }
  find(x) { while (this.p[x] !== x) x = this.p[x] = this.p[this.p[x]]; return x; }
  unite(a, b) { a = this.find(a); b = this.find(b); if (a === b) return false; this.p[a] = b; this.c--; return true; }
  connected(a, b) { return this.find(a) === this.find(b); }
  count() { return this.c; }
}`,
  '11-graph': `class Graph {
  constructor(d) { this.d = d; this.adj = new Map(); }
  addVertex(v) { if (this.adj.has(v)) return false; this.adj.set(v, []); return true; }
  addEdge(u, v) {
    this.addVertex(u); this.addVertex(v);
    if (this.adj.get(u).includes(v)) return false;
    this.adj.get(u).push(v); if (!this.d && u !== v) this.adj.get(v).push(u); return true;
  }
  removeEdge(u, v) {
    const a = this.adj.get(u); if (!a || !a.includes(v)) return false;
    a.splice(a.indexOf(v), 1); if (!this.d && u !== v) { const b = this.adj.get(v); b.splice(b.indexOf(u), 1); } return true;
  }
  hasEdge(u, v) { return !!this.adj.get(u)?.includes(v); }
  neighbors(v) { return [...(this.adj.get(v) ?? [])]; }
  vertexCount() { return this.adj.size; }
}`,
  '12-bfs-dfs': `class Graph {
  constructor(n, edges) { this.n = n; this.g = Array.from({ length: n }, () => []); for (const [u, v] of edges) this.g[u].push(v); }
  bfs(s) { if (s < 0 || s >= this.n) return []; const seen = new Set([s]), q = [s], out = []; while (q.length) { const u = q.shift(); out.push(u); for (const v of this.g[u]) if (!seen.has(v)) { seen.add(v); q.push(v); } } return out; }
  dfs(s) { if (s < 0 || s >= this.n) return []; const seen = new Set(), out = []; const go = u => { seen.add(u); out.push(u); for (const v of this.g[u]) if (!seen.has(v)) go(v); }; go(s); return out; }
  pathExists(a, b) { return this.bfs(a).includes(b); }
}`,
  '13-dijkstra': `function shortestPath(n, edges, s, t) {
  const dist = Array(n).fill(Infinity), prev = Array(n).fill(-1), done = Array(n).fill(false);
  dist[s] = 0;
  for (;;) {
    let u = -1; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break; done[u] = true;
    for (const [a, b, w] of edges) if (a === u && dist[u] + w < dist[b]) { dist[b] = dist[u] + w; prev[b] = u; }
  }
  if (dist[t] === Infinity) return [];
  const p = []; for (let v = t; v !== -1; v = prev[v]) p.unshift(v); return p;
}`,
  '14-topological-sort': `function topoSort(n, edges) {
  const g = Array.from({ length: n }, () => []), indeg = Array(n).fill(0);
  for (const [u, v] of edges) { g[u].push(v); indeg[v]++; }
  const q = [], out = []; for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  while (q.length) { const u = q.shift(); out.push(u); for (const v of g[u]) if (!--indeg[v]) q.push(v); }
  return out.length === n ? out : [];
}`,
  '15-lru-cache': `class LRUCache {
  constructor(c) { this.c = c; this.m = new Map(); }
  get(k) { if (!this.m.has(k)) return -1; const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v; }
  put(k, v) { if (!this.c) return; this.m.delete(k); this.m.set(k, v); if (this.m.size > this.c) this.m.delete(this.m.keys().next().value); }
  remove(k) { return this.m.delete(k); }
  size() { return this.m.size; }
}`,

  '18-rate-limiter': `class RateLimiter {
  constructor(cap, rate) { this.cap = cap * 1000; this.rate = rate; this.mt = this.cap; this.last = 0; }
  refill(now) { this.mt = Math.min(this.cap, this.mt + (now - this.last) * this.rate); this.last = now; }
  allow(now) { this.refill(now); if (this.mt >= 1000) { this.mt -= 1000; return true; } return false; }
  available(now) { this.refill(now); return Math.floor(this.mt / 1000); }
}`,
  '20-pubsub': `class PubSub {
  constructor(cap) { this.cap = cap; this.subs = new Map(); this.box = new Map(); }
  subscribe(s, t) { const set = this.subs.get(t) ?? new Set(); if (set.has(s)) return false; set.add(s); this.subs.set(t, set); return true; }
  unsubscribe(s, t) { return this.subs.get(t)?.delete(s) ?? false; }
  publish(t, msg) {
    const set = this.subs.get(t); if (!set) return 0;
    for (const s of set) { const b = this.box.get(s) ?? []; b.push(msg); if (b.length > this.cap) b.shift(); this.box.set(s, b); }
    return set.size;
  }
  poll(s) { const b = this.box.get(s) ?? []; this.box.set(s, []); return b; }
}`,
  '21-lexer': `function tokenize(src) {
  const out = []; let i = 0;
  const isId = c => /[A-Za-z_]/.test(c), isD = c => /[0-9]/.test(c);
  while (i < src.length) {
    const c = src[i];
    if (' \\t\\n\\r'.includes(c)) { i++; continue; }
    if (isId(c)) { let j = i; while (j < src.length && (isId(src[j]) || isD(src[j]))) j++; out.push('IDENT:' + src.slice(i, j)); i = j; continue; }
    if (isD(c)) { let j = i; while (isD(src[j] ?? '')) j++; if (src[j] === '.' && isD(src[j + 1] ?? '')) { j++; while (isD(src[j] ?? '')) j++; } out.push('NUMBER:' + src.slice(i, j)); i = j; continue; }
    if (c === '"') {
      let j = i + 1, val = '';
      for (;;) {
        if (j >= src.length) { out.push('ERROR:' + i); return out; }
        const d = src[j];
        if (d === '"') break;
        if (d === '\\\\') { const e = { '"': '"', '\\\\': '\\\\', n: '\\n', t: '\\t' }[src[j + 1]]; if (e === undefined) { out.push('ERROR:' + j); return out; } val += e; j += 2; continue; }
        val += d; j++;
      }
      out.push('STRING:' + val); i = j + 1; continue;
    }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '<=', '>='].includes(two)) { out.push('OP:' + two); i += 2; continue; }
    if ('+-*/=<>'.includes(c)) { out.push('OP:' + c); i++; continue; }
    const p = { '(': 'LPAREN', ')': 'RPAREN', ',': 'COMMA' }[c];
    if (p) { out.push(p); i++; continue; }
    out.push('ERROR:' + i); return out;
  }
  out.push('EOF'); return out;
}`,
  '22-expression-parser': `function evaluate(s) {
  let i = 0;
  const ws = () => { while (s[i] === ' ') i++; };
  const fail = () => { throw 'e'; };
  function expr() { let v = term(); for (;;) { ws(); if (s[i] === '+') { i++; v += term(); } else if (s[i] === '-') { i++; v -= term(); } else return v; } }
  function term() { let v = factor(); for (;;) { ws(); if (s[i] === '*') { i++; v *= factor(); } else if (s[i] === '/') { i++; const d = factor(); if (d === 0) fail(); v = Math.trunc(v / d); } else return v; } }
  function factor() {
    ws();
    if (s[i] === '-') { i++; return -factor(); }
    if (s[i] === '(') { i++; const v = expr(); ws(); if (s[i] !== ')') fail(); i++; return v; }
    const m = /^[0-9]+/.exec(s.slice(i)); if (!m) fail(); i += m[0].length; return +m[0];
  }
  try { const v = expr(); ws(); if (i !== s.length) fail(); return String(v + 0); } catch { return 'error'; }
}`,
  '23-json-parser': `function normalize(s) {
  let i = 0;
  const bad = () => { throw 'invalid'; };
  const ws = () => { while (' \\t\\n\\r'.includes(s[i]) && i < s.length) i++; };
  const esc = str => '"' + [...str].map(c => { const n = c.codePointAt(0);
    if (c === '"') return '\\\\"'; if (c === '\\\\') return '\\\\\\\\';
    const named = { '\\b': '\\\\b', '\\f': '\\\\f', '\\n': '\\\\n', '\\r': '\\\\r', '\\t': '\\\\t' }[c]; if (named) return named;
    if (n < 0x20) return '\\\\u' + n.toString(16).padStart(4, '0'); return c; }).join('') + '"';
  function str() {
    i++; let out = '';
    for (;;) {
      if (i >= s.length) bad();
      const c = s[i];
      if (c === '"') { i++; return out; }
      if (c.charCodeAt(0) < 0x20) bad();
      if (c === '\\\\') {
        const e = s[i + 1];
        const m = { '"': '"', '\\\\': '\\\\', '/': '/', b: '\\b', f: '\\f', n: '\\n', r: '\\r', t: '\\t' }[e];
        if (m !== undefined) { out += m; i += 2; continue; }
        if (e === 'u') { const h = s.slice(i + 2, i + 6); if (!/^[0-9a-fA-F]{4}$/.test(h)) bad(); out += String.fromCharCode(parseInt(h, 16)); i += 6; continue; }
        bad();
      }
      out += c; i++;
    }
  }
  function value() {
    ws();
    const c = s[i];
    if (c === '{') { i++; ws(); const parts = []; if (s[i] === '}') { i++; return '{}'; }
      for (;;) { ws(); if (s[i] !== '"') bad(); const k = esc(str()); ws(); if (s[i] !== ':') bad(); i++; parts.push(k + ':' + value()); ws();
        if (s[i] === ',') { i++; continue; } if (s[i] === '}') { i++; return '{' + parts.join(',') + '}'; } bad(); } }
    if (c === '[') { i++; ws(); const parts = []; if (s[i] === ']') { i++; return '[]'; }
      for (;;) { parts.push(value()); ws(); if (s[i] === ',') { i++; continue; } if (s[i] === ']') { i++; return '[' + parts.join(',') + ']'; } bad(); } }
    if (c === '"') return esc(str());
    for (const lit of ['true', 'false', 'null']) if (s.startsWith(lit, i)) { i += lit.length; return lit; }
    const m = /^-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?/.exec(s.slice(i));
    if (!m || !m[0] || m[0] === '-') bad();
    i += m[0].length; return m[0];
  }
  try { const v = value(); ws(); if (i !== s.length) bad(); return v; } catch { return 'invalid'; }
}`,
  '24-serialization': `class Codec {
  encode(type, payload) {
    const b = [...new TextEncoder().encode(payload)];
    if (type < 1 || type > 3 || b.length > 65535) return [];
    return [type, b.length >>> 24, (b.length >>> 16) & 255, (b.length >>> 8) & 255, b.length & 255, ...b];
  }
  decode(b) {
    if (b.length < 5) return 'error:truncated';
    if (b[0] < 1 || b[0] > 3) return 'error:type';
    const n = ((b[1] << 24) >>> 0) + (b[2] << 16) + (b[3] << 8) + b[4];
    if (n > 65535) return 'error:too-large';
    if (b.length < 5 + n) return 'error:truncated';
    if (b.length > 5 + n) return 'error:trailing';
    return b[0] + ':' + new TextDecoder().decode(new Uint8Array(b.slice(5)));
  }
}`,
  '25-command-parser': `function parse(line) {
  const args = []; let i = 0;
  while (i < line.length) {
    if (/\\s/.test(line[i])) { i++; continue; }
    if (line[i] === '"') {
      let j = i + 1, v = '';
      for (;;) {
        if (j >= line.length) return ['ERR', 'quote'];
        if (line[j] === '\\\\' && (line[j + 1] === '"' || line[j + 1] === '\\\\')) { v += line[j + 1]; j += 2; continue; }
        if (line[j] === '"') break;
        v += line[j++];
      }
      if (j + 1 < line.length && !/\\s/.test(line[j + 1])) return ['ERR', 'quote'];
      args.push(v); i = j + 1; continue;
    }
    let j = i; while (j < line.length && !/\\s/.test(line[j])) j++;
    args.push(line.slice(i, j)); i = j;
  }
  if (!args.length) return ['ERR', 'empty'];
  const name = args[0].toUpperCase(), n = args.length - 1;
  const arity = { SET: n === 2, GET: n === 1, TTL: n === 1, DEL: n >= 1, EXISTS: n >= 1, EXPIRE: n === 2 };
  if (!(name in arity)) return ['ERR', 'unknown'];
  if (!arity[name]) return ['ERR', 'arity'];
  if (name === 'EXPIRE' && !/^-?[0-9]+$/.test(args[2])) return ['ERR', 'integer'];
  return [name, ...args.slice(1)];
}`,
  '26-kv-engine': `class Engine {
  constructor() { this.m = new Map(); }
  set(k, v) { this.m.set(k, v); }
  get(k) { return this.m.has(k) ? this.m.get(k) : '(nil)'; }
  remove(k) { return this.m.delete(k); }
  exists(k) { return this.m.has(k); }
  size() { return this.m.size; }
  keys(p) {
    const match = (pi, si, k) => {
      if (pi === p.length) return si === k.length;
      if (p[pi] === '*') return match(pi + 1, si, k) || (si < k.length && match(pi, si + 1, k));
      return si < k.length && (p[pi] === '?' || p[pi] === k[si]) && match(pi + 1, si + 1, k);
    };
    return [...this.m.keys()].filter(k => match(0, 0, k)).sort();
  }
}`,
  '27-ttl-engine': `class TTLEngine {
  constructor() { this.v = new Map(); this.at = new Map(); }
  live(k, now) { if (this.at.has(k) && now >= this.at.get(k)) { this.v.delete(k); this.at.delete(k); } return this.v.has(k); }
  set(k, val, now) { this.v.set(k, val); this.at.delete(k); }
  get(k, now) { return this.live(k, now) ? this.v.get(k) : '(nil)'; }
  expire(k, sec, now) { if (!this.live(k, now)) return false; if (sec <= 0) { this.v.delete(k); this.at.delete(k); } else this.at.set(k, now + sec * 1000); return true; }
  ttl(k, now) { if (!this.live(k, now)) return -2; if (!this.at.has(k)) return -1; return Math.ceil((this.at.get(k) - now) / 1000); }
  persist(k, now) { return this.live(k, now) && this.at.delete(k); }
  remove(k, now) { const had = this.live(k, now); this.v.delete(k); this.at.delete(k); return had; }
}`,
  '28-wal': `class Wal {
  encode(recs) { return recs.flatMap(r => { const b = [...new TextEncoder().encode(r)]; const n = b.length; return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255, ...b, b.reduce((a, x) => a + x, 0) % 256]; }); }
  recover(b) {
    const out = []; let i = 0;
    while (i + 4 <= b.length) {
      const n = ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
      if (i + 4 + n + 1 > b.length) break;
      const p = b.slice(i + 4, i + 4 + n);
      if (p.reduce((a, x) => a + x, 0) % 256 !== b[i + 4 + n]) break;
      out.push(new TextDecoder().decode(new Uint8Array(p))); i += 5 + n;
    }
    return out;
  }
  replay(b) {
    const st = new Map();
    for (const r of this.recover(b)) {
      let m;
      if ((m = /^SET (\\S+) (.*)$/s.exec(r))) st.set(m[1], m[2]);
      else if ((m = /^DEL (\\S+)$/.exec(r))) st.delete(m[1]);
    }
    return [...st.keys()].sort().map(k => k + '=' + st.get(k));
  }
}`,
  '30-mini-redis': `class MiniRedis {
  constructor() { this.v = new Map(); this.at = new Map(); }
  live(k, now) { if (this.at.has(k) && now >= this.at.get(k)) { this.v.delete(k); this.at.delete(k); } return this.v.has(k); }
  exec(line, now) {
    const args = []; let i = 0;
    while (i < line.length) {
      if (/\\s/.test(line[i])) { i++; continue; }
      if (line[i] === '"') {
        let j = i + 1, v = '';
        for (;;) {
          if (j >= line.length) return '(error) ERR unbalanced quotes';
          if (line[j] === '\\\\' && (line[j + 1] === '"' || line[j + 1] === '\\\\')) { v += line[j + 1]; j += 2; continue; }
          if (line[j] === '"') break;
          v += line[j++];
        }
        if (j + 1 < line.length && !/\\s/.test(line[j + 1])) return '(error) ERR unbalanced quotes';
        args.push(v); i = j + 1; continue;
      }
      let j = i; while (j < line.length && !/\\s/.test(line[j])) j++;
      args.push(line.slice(i, j)); i = j;
    }
    if (!args.length) return '(error) ERR empty command';
    const name = args[0].toUpperCase(), a = args.slice(1), n = a.length;
    const arity = { SET: n === 2, GET: n === 1, TTL: n === 1, DEL: n >= 1, EXISTS: n >= 1, EXPIRE: n === 2 };
    if (!(name in arity)) return '(error) ERR unknown command';
    if (!arity[name]) return '(error) ERR wrong number of arguments';
    const int = x => '(integer) ' + x;
    switch (name) {
      case 'SET': this.v.set(a[0], a[1]); this.at.delete(a[0]); return 'OK';
      case 'GET': return this.live(a[0], now) ? this.v.get(a[0]) : '(nil)';
      case 'DEL': return int(a.filter(k => { const had = this.live(k, now); this.v.delete(k); this.at.delete(k); return had; }).length);
      case 'EXISTS': return int(a.filter(k => this.live(k, now)).length);
      case 'EXPIRE': {
        if (!/^-?[0-9]+$/.test(a[1])) return '(error) ERR value is not an integer';
        if (!this.live(a[0], now)) return int(0);
        const s = +a[1]; if (s <= 0) { this.v.delete(a[0]); this.at.delete(a[0]); } else this.at.set(a[0], now + s * 1000);
        return int(1);
      }
      case 'TTL': if (!this.live(a[0], now)) return int(-2); if (!this.at.has(a[0])) return int(-1); return int(Math.ceil((this.at.get(a[0]) - now) / 1000));
    }
  }
}`,

  // ---- Engineer's toolkit ----
  'kit-01-hashing': `class Hasher {
  fnv1a(s) { let h = 2166136261; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  mix32(h) { h >>>= 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; }
}`,
  'kit-02-bloom-filter': `const fnv = s => { let h = 2166136261; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
const mix = h => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };
const hash = s => mix(fnv(s));
class BloomFilter {
  constructor(m, k) { this.m = m; this.k = k; this.bits = new Uint8Array(m); }
  idx(key) { const h1 = hash(key), h2 = hash(key + '#'); return Array.from({ length: this.k }, (_, i) => (h1 + i * h2) % this.m); }
  add(key) { for (const i of this.idx(key)) this.bits[i] = 1; }
  mightContain(key) { return this.idx(key).every(i => this.bits[i]); }
  bitCount() { return this.bits.reduce((a, b) => a + b, 0); }
}`,
  'kit-03-count-min-sketch': `const fnv = s => { let h = 2166136261; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
const mix = h => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };
const hash = s => mix(fnv(s));
class CountMinSketch {
  constructor(w, d) { this.w = w; this.d = d; this.t = Array.from({ length: d }, () => new Array(w).fill(0)); this.n = 0; }
  cols(key) { const h1 = hash(key), h2 = hash(key + '#'); return this.t.map((_, i) => (h1 + i * h2) % this.w); }
  add(key, c) { this.cols(key).forEach((col, i) => (this.t[i][col] += c)); this.n += c; }
  estimate(key) { return Math.min(...this.cols(key).map((col, i) => this.t[i][col])); }
  total() { return this.n; }
}`,
  'kit-04-hyperloglog': `const fnv = s => { let h = 2166136261; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
const mix = h => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };
class HyperLogLog {
  constructor(p) { this.p = p; this.m = 1 << p; this.r = new Array(this.m).fill(0); }
  add(key) {
    const x = mix(fnv(key)), j = x >>> (32 - this.p), w = (x << this.p) >>> 0;
    const rank = w === 0 ? 32 - this.p + 1 : Math.clz32(w) + 1;
    this.r[j] = Math.max(this.r[j], rank);
  }
  count() {
    const m = this.m, a = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
    let sum = 0, zeros = 0; for (const v of this.r) { sum += Math.pow(2, -v); if (!v) zeros++; }
    let e = (a * m * m) / sum;
    if (e <= 2.5 * m && zeros > 0) e = m * Math.log(m / zeros);
    return Math.floor(e + 0.5);
  }
}`,
  'kit-05-consistent-hashing': `const fnv = s => { let h = 2166136261; for (const b of new TextEncoder().encode(s)) { h ^= b; h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
const mix = h => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };
const hash = s => mix(fnv(s));
class ConsistentHashRing {
  constructor(r) { this.r = r; this.nodes = new Set(); this.ring = []; }
  rebuild() { this.ring = [...this.nodes].flatMap(n => Array.from({ length: this.r }, (_, i) => [hash(n + '#' + i), n])).sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)); }
  addNode(n) { if (this.nodes.has(n)) return false; this.nodes.add(n); this.rebuild(); return true; }
  removeNode(n) { if (!this.nodes.delete(n)) return false; this.rebuild(); return true; }
  getNode(key) { if (!this.ring.length) return ''; const h = hash(key); return (this.ring.find(v => v[0] >= h) ?? this.ring[0])[1]; }
}`,
  'kit-06-skip-list': `class SkipList {
  constructor() { this.a = []; }
  insert(v) { if (this.a.includes(v)) return false; this.a.push(v); this.a.sort((x, y) => x - y); return true; }
  contains(v) { return this.a.includes(v); }
  remove(v) { const i = this.a.indexOf(v); if (i < 0) return false; this.a.splice(i, 1); return true; }
  size() { return this.a.length; }
  toArray() { return [...this.a]; }
}`,
  'kit-07-lfu-cache': `class LFUCache {
  constructor(c) { this.c = c; this.m = new Map(); this.t = 0; }
  get(k) { const e = this.m.get(k); if (!e) return -1; e.f++; e.t = this.t++; return e.v; }
  put(k, v) {
    if (!this.c) return;
    const e = this.m.get(k); if (e) { e.v = v; e.f++; e.t = this.t++; return; }
    if (this.m.size === this.c) { let worst; for (const [key, x] of this.m) if (!worst || x.f < worst[1].f || (x.f === worst[1].f && x.t < worst[1].t)) worst = [key, x]; this.m.delete(worst[0]); }
    this.m.set(k, { v, f: 1, t: this.t++ });
  }
}`,
  'kit-08-fenwick-tree': `class FenwickTree {
  constructor(n) { this.a = new Array(n).fill(0); }
  add(i, d) { this.a[i] += d; }
  prefixSum(i) { let s = 0; for (let k = 0; k <= i; k++) s += this.a[k]; return s; }
  rangeSum(l, r) { return this.prefixSum(r) - (l ? this.prefixSum(l - 1) : 0); }
}`,
  'kit-09-segment-tree': `class SegmentTree {
  constructor(v) { this.v = [...v]; }
  update(i, x) { this.v[i] = x; }
  rangeMin(l, r) { return Math.min(...this.v.slice(l, r + 1)); }
}`,
  'kit-10-transactional-kv': `class TxStore {
  constructor() { this.base = new Map(); this.tx = []; }
  view() { const m = new Map(this.base); for (const l of this.tx) for (const [k, v] of l) v === null ? m.delete(k) : m.set(k, v); return m; }
  set(k, v) { (this.tx.at(-1) ?? this.base).set(k, v); }
  get(k) { return this.view().get(k) ?? '(nil)'; }
  remove(k) { if (!this.view().has(k)) return false; if (this.tx.length) this.tx.at(-1).set(k, null); else this.base.delete(k); return true; }
  count(v) { let n = 0; for (const x of this.view().values()) if (x === v) n++; return n; }
  begin() { this.tx.push(new Map()); }
  rollback() { return this.tx.pop() !== undefined; }
  commit() {
    const top = this.tx.pop(); if (!top) return false;
    const into = this.tx.at(-1);
    for (const [k, v] of top) { if (into) into.set(k, v); else v === null ? this.base.delete(k) : this.base.set(k, v); }
    return true;
  }
}`,
  'kit-11-circuit-breaker': `class CircuitBreaker {
  constructor(th, cd) { this.th = th; this.cd = cd; this.s = 'closed'; this.f = 0; this.at = 0; this.trial = false; }
  tick(now) { if (this.s === 'open' && now >= this.at + this.cd) { this.s = 'half-open'; this.trial = false; } }
  allow(now) {
    this.tick(now);
    if (this.s === 'closed') return true;
    if (this.s === 'half-open' && !this.trial) { this.trial = true; return true; }
    return false;
  }
  record(ok, now) {
    this.tick(now);
    if (this.s === 'open') return;
    if (this.s === 'half-open') { if (ok) { this.s = 'closed'; this.f = 0; } else { this.s = 'open'; this.at = now; } return; }
    if (ok) { this.f = 0; return; }
    if (++this.f >= this.th) { this.s = 'open'; this.at = now; }
  }
  state(now) { this.tick(now); return this.s; }
}`,
  'kit-12-timing-wheel': `class TimingWheel {
  constructor(slots) { this.now = 0; this.q = []; }
  schedule(id, d) { this.cancel(id); this.q.push([id, this.now + d]); }
  cancel(id) { const i = this.q.findIndex(e => e[0] === id); if (i < 0) return false; this.q.splice(i, 1); return true; }
  tick() { this.now++; const due = this.q.filter(e => e[1] === this.now).map(e => e[0]); this.q = this.q.filter(e => e[1] !== this.now); return due; }
  pending() { return this.q.length; }
}`,
  'kit-13-regex-engine': `function matches(pattern, text) {
  // Parse to AST, compile to a Thompson NFA, simulate with state sets.
  let i = 0;
  const alt = () => { let l = cat(); while (pattern[i] === '|') { i++; l = { t: '|', a: l, b: cat() }; } return l; };
  const cat = () => { let l = { t: 'e' }; while (i < pattern.length && pattern[i] !== '|' && pattern[i] !== ')') l = { t: '.', a: l, b: post() }; return l; };
  const post = () => { let a = atom(); while ('*+?'.includes(pattern[i] ?? 'x')) a = { t: pattern[i++], a }; return a; };
  const atom = () => { const c = pattern[i++]; if (c === '(') { const a = alt(); i++; return a; } return c === '.' ? { t: 'any' } : { t: 'c', c }; };
  const ast = alt();
  const S = []; const st = () => (S.push({ e: [] }), S.length - 1);
  const build = n => { // returns [start, end]
    const s = st(), e = st();
    switch (n.t) {
      case 'e': S[s].e.push(e); break;
      case 'c': case 'any': S[s].ch = n.t === 'any' ? null : n.c; S[s].any = n.t === 'any'; S[s].to = e; break;
      case '.': { const [a1, a2] = build(n.a), [b1, b2] = build(n.b); S[s].e.push(a1); S[a2].e.push(b1); S[b2].e.push(e); break; }
      case '|': { const [a1, a2] = build(n.a), [b1, b2] = build(n.b); S[s].e.push(a1, b1); S[a2].e.push(e); S[b2].e.push(e); break; }
      case '*': { const [a1, a2] = build(n.a); S[s].e.push(a1, e); S[a2].e.push(a1, e); break; }
      case '+': { const [a1, a2] = build(n.a); S[s].e.push(a1); S[a2].e.push(a1, e); break; }
      case '?': { const [a1, a2] = build(n.a); S[s].e.push(a1, e); S[a2].e.push(e); break; }
    }
    return [s, e];
  };
  const [start, end] = build(ast);
  const close = set => { const out = new Set(set), stack = [...set]; while (stack.length) for (const n of S[stack.pop()].e) if (!out.has(n)) { out.add(n); stack.push(n); } return out; };
  let cur = close([start]);
  for (const ch of text) { const nx = []; for (const s of cur) if (S[s].to !== undefined && (S[s].any || S[s].ch === ch)) nx.push(S[s].to); cur = close(nx); }
  return cur.has(end);
}`,
  'kit-14-line-diff': `function diff(a, b) {
  const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push('  ' + a[i]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push('- ' + a[i++]);
    else out.push('+ ' + b[j++]);
  }
  while (i < n) out.push('- ' + a[i++]);
  while (j < m) out.push('+ ' + b[j++]);
  return out;
}`,
  'kit-15-utf8-codec': `class Utf8 {
  encode(cps) {
    const out = [];
    for (let c of cps) {
      if (c < 0 || c > 0x10ffff || (c >= 0xd800 && c <= 0xdfff)) c = 0xfffd;
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  decode(b) {
    const out = []; let i = 0;
    while (i < b.length) {
      const x = b[i];
      if (x < 0x80) { out.push(x); i++; continue; }
      const n = x >= 0xc2 && x <= 0xdf ? 1 : x >= 0xe0 && x <= 0xef ? 2 : x >= 0xf0 && x <= 0xf4 ? 3 : 0;
      let cp = n ? x & (0x3f >> n) : -1, ok = n > 0;
      for (let k = 1; ok && k <= n; k++) { const y = b[i + k]; if (y === undefined || (y & 0xc0) !== 0x80) ok = false; else cp = (cp << 6) | (y & 63); }
      if (ok && ((n === 2 && cp < 0x800) || (n === 3 && cp < 0x10000) || (cp >= 0xd800 && cp <= 0xdfff) || cp > 0x10ffff)) ok = false;
      if (ok) { out.push(cp); i += n + 1; } else { out.push(0xfffd); i++; }
    }
    return out;
  }
}`,
};

export const PY = {
  '15-lru-cache': `
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity: int):
        self.c, self.d = capacity, OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.d: return -1
        self.d.move_to_end(key); return self.d[key]
    def put(self, key: int, value: int) -> None:
        if self.c == 0: return
        self.d[key] = value; self.d.move_to_end(key)
        if len(self.d) > self.c: self.d.popitem(last=False)
    def remove(self, key: int) -> bool:
        return self.d.pop(key, None) is not None
    def size(self) -> int:
        return len(self.d)
`,
  '09-trie': `
class Trie:
    def __init__(self): self.w = set()
    def insert(self, word): self.w.add(word)
    def contains(self, word): return word in self.w
    def startsWith(self, prefix): return any(x.startswith(prefix) for x in self.w)
    def remove(self, word):
        if word in self.w: self.w.remove(word); return True
        return False
    def wordsWithPrefix(self, prefix): return sorted(x for x in self.w if x.startswith(prefix))
`,

  // Independent Python versions of the hash-based toolkit problems: they must reproduce
  // the expected values that were generated from the JS references.
  'kit-01-hashing': `
class Hasher:
    def fnv1a(self, s: str) -> int:
        h = 2166136261
        for b in s.encode():
            h = ((h ^ b) * 16777619) & 0xFFFFFFFF
        return h
    def mix32(self, h: int) -> int:
        h ^= h >> 16; h = (h * 0x85EBCA6B) & 0xFFFFFFFF
        h ^= h >> 13; h = (h * 0xC2B2AE35) & 0xFFFFFFFF
        return h ^ (h >> 16)
`,
  'kit-02-bloom-filter': `
def _hash(s):
    h = 2166136261
    for b in s.encode(): h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    h ^= h >> 16; h = (h * 0x85EBCA6B) & 0xFFFFFFFF; h ^= h >> 13; h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)
class BloomFilter:
    def __init__(self, m, k): self.m, self.k, self.bits = m, k, [0] * m
    def _idx(self, key): h1, h2 = _hash(key), _hash(key + "#"); return [(h1 + i * h2) % self.m for i in range(self.k)]
    def add(self, key):
        for i in self._idx(key): self.bits[i] = 1
    def mightContain(self, key): return all(self.bits[i] for i in self._idx(key))
    def bitCount(self): return sum(self.bits)
`,
  'kit-03-count-min-sketch': `
def _hash(s):
    h = 2166136261
    for b in s.encode(): h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    h ^= h >> 16; h = (h * 0x85EBCA6B) & 0xFFFFFFFF; h ^= h >> 13; h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)
class CountMinSketch:
    def __init__(self, w, d): self.w, self.d, self.t, self.n = w, d, [[0] * w for _ in range(d)], 0
    def _cols(self, key): h1, h2 = _hash(key), _hash(key + "#"); return [(h1 + i * h2) % self.w for i in range(self.d)]
    def add(self, key, c):
        for i, col in enumerate(self._cols(key)): self.t[i][col] += c
        self.n += c
    def estimate(self, key): return min(self.t[i][col] for i, col in enumerate(self._cols(key)))
    def total(self): return self.n
`,
  'kit-04-hyperloglog': `
import math
def _hash(s):
    h = 2166136261
    for b in s.encode(): h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    h ^= h >> 16; h = (h * 0x85EBCA6B) & 0xFFFFFFFF; h ^= h >> 13; h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)
class HyperLogLog:
    def __init__(self, p): self.p, self.m = p, 1 << p; self.r = [0] * self.m
    def add(self, key):
        x = _hash(key); j = x >> (32 - self.p); w = (x << self.p) & 0xFFFFFFFF
        rank = 32 - self.p + 1 if w == 0 else 32 - w.bit_length() + 1
        self.r[j] = max(self.r[j], rank)
    def count(self):
        m = self.m
        a = {16: 0.673, 32: 0.697, 64: 0.709}.get(m, 0.7213 / (1 + 1.079 / m))
        e = a * m * m / sum(2.0 ** -v for v in self.r)
        zeros = self.r.count(0)
        if e <= 2.5 * m and zeros: e = m * math.log(m / zeros)
        return math.floor(e + 0.5)
`,
  'kit-05-consistent-hashing': `
import bisect
def _hash(s):
    h = 2166136261
    for b in s.encode(): h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    h ^= h >> 16; h = (h * 0x85EBCA6B) & 0xFFFFFFFF; h ^= h >> 13; h = (h * 0xC2B2AE35) & 0xFFFFFFFF
    return h ^ (h >> 16)
class ConsistentHashRing:
    def __init__(self, r): self.r, self.nodes, self.ring = r, set(), []
    def _build(self): self.ring = sorted((_hash(f"{n}#{i}"), n) for n in self.nodes for i in range(self.r))
    def addNode(self, n):
        if n in self.nodes: return False
        self.nodes.add(n); self._build(); return True
    def removeNode(self, n):
        if n not in self.nodes: return False
        self.nodes.remove(n); self._build(); return True
    def getNode(self, key):
        if not self.ring: return ""
        i = bisect.bisect_left(self.ring, (_hash(key), ""))
        return self.ring[i % len(self.ring)][1]
`,
};

export const CPP = {
  '15-lru-cache': `
class LRUCache {
    int cap; list<pair<int,int>> l; unordered_map<int, list<pair<int,int>>::iterator> m;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) { auto it = m.find(key); if (it == m.end()) return -1; l.splice(l.begin(), l, it->second); return it->second->second; }
    void put(int key, int value) {
        if (cap == 0) return;
        auto it = m.find(key);
        if (it != m.end()) { it->second->second = value; l.splice(l.begin(), l, it->second); return; }
        l.push_front({key, value}); m[key] = l.begin();
        if ((int)m.size() > cap) { m.erase(l.back().first); l.pop_back(); }
    }
    bool remove(int key) { auto it = m.find(key); if (it == m.end()) return false; l.erase(it->second); m.erase(it); return true; }
    int size() { return m.size(); }

};`,
  '14-topological-sort': `
vector<int> topoSort(int n, vector<vector<int>>& edges) {
    vector<vector<int>> g(n); vector<int> in(n), out;
    for (auto& e : edges) { g[e[0]].push_back(e[1]); in[e[1]]++; }
    queue<int> q; for (int i = 0; i < n; i++) if (!in[i]) q.push(i);
    while (!q.empty()) { int u = q.front(); q.pop(); out.push_back(u); for (int v : g[u]) if (!--in[v]) q.push(v); }
    return (int)out.size() == n ? out : vector<int>{};
}`,
  '09-trie': `
class Trie { set<string> w;
public:
    Trie() {}
    void insert(string word) { w.insert(word); }
    bool contains(string word) { return w.count(word); }
    bool startsWith(string p) { for (auto& x : w) if (x.rfind(p, 0) == 0) return true; return false; }
    bool remove(string word) { return w.erase(word); }
    vector<string> wordsWithPrefix(string p) { vector<string> r; for (auto& x : w) if (x.rfind(p, 0) == 0) r.push_back(x); return r; }
};`,

  'kit-01-hashing': `
class Hasher {
public:
    Hasher() {}
    long long fnv1a(string s) { uint32_t h = 2166136261u; for (unsigned char c : s) { h ^= c; h *= 16777619u; } return h; }
    long long mix32(long long v) { uint32_t h = (uint32_t)v; h ^= h >> 16; h *= 0x85ebca6bu; h ^= h >> 13; h *= 0xc2b2ae35u; h ^= h >> 16; return h; }
};`,
};

export const GO = {
  '15-lru-cache': `package main

type entry struct{ k, v int; prev, next *entry }
type LRUCache struct{ cap int; m map[int]*entry; head, tail *entry }

func NewLRUCache(capacity int) *LRUCache {
	h, t := &entry{}, &entry{}
	h.next, t.prev = t, h
	return &LRUCache{cap: capacity, m: map[int]*entry{}, head: h, tail: t}
}
func (c *LRUCache) unlink(e *entry) { e.prev.next, e.next.prev = e.next, e.prev }
func (c *LRUCache) front(e *entry) { e.next, e.prev = c.head.next, c.head; c.head.next.prev = e; c.head.next = e }
func (c *LRUCache) Get(key int) int {
	e, ok := c.m[key]
	if !ok { return -1 }
	c.unlink(e); c.front(e)
	return e.v
}
func (c *LRUCache) Put(key int, value int) {
	if c.cap == 0 { return }
	if e, ok := c.m[key]; ok { e.v = value; c.unlink(e); c.front(e); return }
	e := &entry{k: key, v: value}
	c.m[key] = e; c.front(e)
	if len(c.m) > c.cap { lru := c.tail.prev; c.unlink(lru); delete(c.m, lru.k) }
}
func (c *LRUCache) Remove(key int) bool {
	e, ok := c.m[key]
	if !ok { return false }
	c.unlink(e); delete(c.m, key)
	return true
}
func (c *LRUCache) Size() int { return len(c.m) }
`,
  '13-dijkstra': `package main

func ShortestPath(n int, edges [][]int, source int, target int) []int {
	const inf = 1 << 60
	dist, prev, done := make([]int, n), make([]int, n), make([]bool, n)
	for i := range dist { dist[i], prev[i] = inf, -1 }
	dist[source] = 0
	for {
		u := -1
		for i := 0; i < n; i++ { if !done[i] && dist[i] < inf && (u < 0 || dist[i] < dist[u]) { u = i } }
		if u < 0 { break }
		done[u] = true
		for _, e := range edges { if e[0] == u && dist[u]+e[2] < dist[e[1]] { dist[e[1]] = dist[u] + e[2]; prev[e[1]] = u } }
	}
	if dist[target] == inf { return nil }
	var path []int
	for v := target; v != -1; v = prev[v] { path = append([]int{v}, path...) }
	return path
}
`,

  'kit-01-hashing': `package main

type Hasher struct{}

func NewHasher() *Hasher { return &Hasher{} }

func (h *Hasher) Fnv1a(s string) int64 {
	x := uint32(2166136261)
	for i := 0; i < len(s); i++ {
		x ^= uint32(s[i])
		x *= 16777619
	}
	return int64(x)
}

func (h *Hasher) Mix32(v int64) int64 {
	x := uint32(v)
	x ^= x >> 16
	x *= 0x85ebca6b
	x ^= x >> 13
	x *= 0xc2b2ae35
	x ^= x >> 16
	return int64(x)
}
`,
};

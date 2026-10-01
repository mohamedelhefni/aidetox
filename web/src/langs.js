// Codegen: one language-neutral problem -> starter code + test harness per language.
//
// Problem shapes (see web/problems/*.json):
//   kind "class": class {name, ctor: [[param, type]], methods: [{name, params, returns}]}
//                 tests [{ctor: [...args], calls: [[method, [...args]]], expected: [...one per call]}]
//   kind "fn":    fn {name, params, returns}; tests [{args: [...], expected}]
// Types: int long bool string double int[] int[][] string[] void   (long = 64-bit, e.g. unsigned 32-bit hashes)
//
// Every harness prints one line per test: "@@R <i> <json result>" or "@@E <i> <json error string>".
// Anything else the user prints is shown as stdout.

const cap = s => s[0].toUpperCase() + s.slice(1);

const TYPES = {
  ts:  { int: 'number', long: 'number', double: 'number', bool: 'boolean', string: 'string', 'int[]': 'number[]', 'int[][]': 'number[][]', 'string[]': 'string[]', void: 'void' },
  py:  { int: 'int', long: 'int', double: 'float', bool: 'bool', string: 'str', 'int[]': 'list[int]', 'int[][]': 'list[list[int]]', 'string[]': 'list[str]', void: 'None' },
  go:  { int: 'int', long: 'int64', double: 'float64', bool: 'bool', string: 'string', 'int[]': '[]int', 'int[][]': '[][]int', 'string[]': '[]string', void: '' },
  cpp: { int: 'int', long: 'long long', double: 'double', bool: 'bool', string: 'string', 'int[]': 'vector<int>', 'int[][]': 'vector<vector<int>>', 'string[]': 'vector<string>', void: 'void' },
};

// ---- literals for compiled languages (JS/Python read the tests as JSON) ----
function goLit(v, t) {
  if (t.endsWith('[]')) return `${TYPES.go[t]}{${v.map(x => goLit(x, t.slice(0, -2))).join(', ')}}`;
  return t === 'string' ? JSON.stringify(v) : String(v);
}
function cppLit(v, t) {
  if (t.endsWith('[]')) return `${TYPES.cpp[t]}{${v.map(x => cppLit(x, t.slice(0, -2))).join(', ')}}`;
  if (t === 'string') return `string(${cppStr(v)}, ${new TextEncoder().encode(v).length})`;
  return t === 'long' ? `${v}LL` : String(v);
}
// C++ string literal. Every byte is escaped as \ooo so control chars, quotes and UTF-8 are all safe;
// the explicit length keeps embedded NULs.
function cppStr(v) {
  return '"' + [...new TextEncoder().encode(v)].map(b => (b >= 0x20 && b < 0x7f && b !== 34 && b !== 92 && b !== 63 ? String.fromCharCode(b) : '\\' + b.toString(8).padStart(3, '0'))).join('') + '"';
}

const doc = p => p.kind === 'class' ? p.class : p.fn;
const sig = (params, fmt) => params.map(([n, t]) => fmt(n, t)).join(', ');

// ---------------------------------------------------------------- JavaScript / TypeScript
function jsStarter(p, ts) {
  const P = params => sig(params, (n, t) => ts ? `${n}: ${TYPES.ts[t]}` : n);
  const R = t => ts ? `: ${TYPES.ts[t]}` : '';
  if (p.kind === 'fn') return `function ${p.fn.name}(${P(p.fn.params)})${R(p.fn.returns)} {\n\n}\n`;
  const c = p.class;
  const methods = c.methods.map(m => `  ${m.name}(${P(m.params)})${R(m.returns)} {\n\n  }`).join('\n\n');
  return `class ${c.name} {\n  constructor(${P(c.ctor)}) {\n\n  }\n\n${methods}\n}\n`;
}
function jsHarness(p, code) {
  const call = p.kind === 'class'
    ? `const o = new ${p.class.name}(...t.ctor);\n    out = t.calls.map(([m, a]) => { const r = o[m](...a); return r === undefined ? null : r; });`
    : `out = ${p.fn.name}(...structuredClone(t.args));\n    if (out === undefined) out = null;`;
  return `${code}
;(() => {
const __tests = ${JSON.stringify(p.tests)};
for (let i = 0; i < __tests.length; i++) {
  const t = __tests[i]; let out;
  try {
    ${call}
    console.log('@@R ' + i + ' ' + JSON.stringify(out));
  } catch (e) { console.log('@@E ' + i + ' ' + JSON.stringify(String(e && e.stack || e))); }
}
})();`;
}

// ---------------------------------------------------------------- Python
function pyStarter(p) {
  const P = params => sig(params, (n, t) => `${n}: ${TYPES.py[t]}`);
  if (p.kind === 'fn') return `def ${p.fn.name}(${P(p.fn.params)}) -> ${TYPES.py[p.fn.returns]}:\n    pass\n`;
  const c = p.class;
  const ctor = `    def __init__(self${c.ctor.length ? ', ' + P(c.ctor) : ''}):\n        pass`;
  const methods = c.methods.map(m => `    def ${m.name}(self${m.params.length ? ', ' + P(m.params) : ''}) -> ${TYPES.py[m.returns]}:\n        pass`);
  return `class ${c.name}:\n${[ctor, ...methods].join('\n\n')}\n`;
}
function pyHarness(p, code) {
  const call = p.kind === 'class'
    ? `o = ${p.class.name}(*t["ctor"])\n        out = [getattr(o, m)(*a) for m, a in t["calls"]]`
    : `out = ${p.fn.name}(*t["args"])`;
  return `${code}

import json as __json, traceback as __tb
for __i, t in enumerate(__json.loads(${JSON.stringify(JSON.stringify(p.tests))})):
    try:
        ${call}
        print("@@R", __i, __json.dumps(out))
    except Exception:
        print("@@E", __i, __json.dumps(__tb.format_exc(limit=-2)))
`;
}

// ---------------------------------------------------------------- Go (run by Yaegi as two chunks: user, harness)
function goStarter(p) {
  const P = params => sig(params, (n, t) => `${n} ${TYPES.go[t]}`);
  const R = t => t === 'void' ? '' : ` ${TYPES.go[t]}`;
  const body = t => t === 'void' ? '' : '\tpanic("TODO")\n';
  if (p.kind === 'fn') return `package main\n\nfunc ${cap(p.fn.name)}(${P(p.fn.params)})${R(p.fn.returns)} {\n${body(p.fn.returns)}}\n`;
  const c = p.class;
  // Receiver: first letter of the type, unless a parameter already uses that name.
  const clash = n => [...c.ctor, ...c.methods.flatMap(m => m.params)].some(([x]) => x === n);
  const r = clash(c.name[0].toLowerCase()) ? c.name[0].toLowerCase() + c.name.slice(1) : c.name[0].toLowerCase();
  const methods = c.methods.map(m => `func (${r} *${c.name}) ${cap(m.name)}(${P(m.params)})${R(m.returns)} {\n${body(m.returns)}}`).join('\n\n');
  return `package main\n\ntype ${c.name} struct {\n}\n\nfunc New${c.name}(${P(c.ctor)}) *${c.name} {\n\treturn &${c.name}{}\n}\n\n${methods}\n`;
}
function goHarness(p) {
  const d = doc(p);
  const ret = (expr, t) => t === 'void' ? `${expr}; __r = append(__r, nil)` : `__r = append(__r, ${t.endsWith('[]') ? `__nz(${expr})` : expr})`;
  const tests = p.tests.map((t, i) => {
    let body;
    if (p.kind === 'class') {
      const byName = Object.fromEntries(d.methods.map(m => [m.name, m]));
      const calls = t.calls.map(([m, a]) => {
        const M = byName[m];
        return ret(`__o.${cap(m)}(${a.map((v, k) => goLit(v, M.params[k][1])).join(', ')})`, M.returns);
      });
      body = [`__o := New${d.name}(${t.ctor.map((v, k) => goLit(v, d.ctor[k][1])).join(', ')})`, '__r := []any{}', ...calls, `fmt.Println("@@R", ${i}, __j(__r))`];
    } else {
      body = ['__r := []any{}', ret(`${cap(d.name)}(${t.args.map((v, k) => goLit(v, d.params[k][1])).join(', ')})`, d.returns), `fmt.Println("@@R", ${i}, __j(__r[0]))`];
    }
    return `\tfunc() {\n\t\tdefer func() { if e := recover(); e != nil { fmt.Println("@@E", ${i}, __j("panic: " + fmt.Sprint(e))) } }()\n${body.map(l => '\t\t' + l).join('\n')}\n\t}()`;
  });
  return `import (\n\t"encoding/json"\n\t"fmt"\n)\n\nfunc __j(v any) string { b, _ := json.Marshal(v); return string(b) }\nfunc __nz[T any](s []T) []T { if s == nil { return []T{} }; return s }\n\nfunc __run() {\n${tests.join('\n')}\n}\n`;
}

// ---------------------------------------------------------------- C++ (compiled by clang to WASI)
const CPP_PRELUDE = `#include <algorithm>
#include <climits>
#include <cmath>
#include <deque>
#include <functional>
#include <iostream>
#include <list>
#include <map>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;
`;
function cppStarter(p) {
  const P = params => sig(params, (n, t) => `${TYPES.cpp[t]}${t.endsWith('[]') ? '&' : ''} ${n}`);
  const body = t => t === 'void' ? '' : '        return {};\n';
  if (p.kind === 'fn') return `${TYPES.cpp[p.fn.returns]} ${p.fn.name}(${P(p.fn.params)}) {\n${body(p.fn.returns).slice(4)}}\n`;
  const c = p.class;
  const methods = c.methods.map(m => `    ${TYPES.cpp[m.returns]} ${m.name}(${P(m.params)}) {\n${body(m.returns)}    }`).join('\n\n');
  return `class ${c.name} {\npublic:\n    ${c.name}(${P(c.ctor)}) {\n    }\n\n${methods}\n};\n`;
}
function cppHarness(p, code) {
  const d = doc(p);
  // Arguments go into named variables first so they bind to vector<T>& parameters.
  const args = (vals, params, pre) => vals.map((v, k) => `auto ${pre}${k} = ${cppLit(v, params[k][1])};`).join(' ');
  const ret = (expr, t) => t === 'void' ? `${expr}; __r.push_back("null");` : `__r.push_back(__j(${expr}));`;
  const tests = p.tests.map((t, i) => {
    let body;
    if (p.kind === 'class') {
      const byName = Object.fromEntries(d.methods.map(m => [m.name, m]));
      const calls = t.calls.map(([m, a], c) => {
        const M = byName[m];
        return `{ ${args(a, M.params, 'a')} ${ret(`__o->${m}(${a.map((_, k) => 'a' + k).join(', ')})`, M.returns)} }`;
      });
      body = [`${args(t.ctor, d.ctor, 'c')}`, `auto* __o = new ${d.name}(${t.ctor.map((_, k) => 'c' + k).join(', ')});`, 'vector<string> __r;', ...calls, `__out(${i}, __r, true);`];
    } else {
      body = [args(t.args, d.params, 'a'), 'vector<string> __r;', ret(`${d.name}(${t.args.map((_, k) => 'a' + k).join(', ')})`, d.returns), `__out(${i}, __r, false);`];
    }
    return `    {\n${body.map(l => '        ' + l).join('\n')}\n    }`;
  });
  return `${CPP_PRELUDE}
${code}

static string __j(bool v) { return v ? "true" : "false"; }
static string __j(int v) { return to_string(v); }
static string __j(long long v) { return to_string(v); }
static string __j(double v) { ostringstream s; s.precision(17); s << v; return s.str(); }
static string __j(const string& v) {
    string o = "\\"";
    for (unsigned char ch : v) {
        if (ch == '"' || ch == '\\\\') { o += '\\\\'; o += ch; }
        else if (ch < 0x20) { char b[8]; snprintf(b, sizeof b, "\\\\u%04x", ch); o += b; }
        else o += ch;
    }
    return o + "\\"";
}
template <class T> static string __j(const vector<T>& v) {
    string o = "[";
    for (size_t k = 0; k < v.size(); k++) { if (k) o += ","; o += __j(v[k]); }
    return o + "]";
}
static void __out(int i, const vector<string>& r, bool many) {
    string o = many ? "[" : "";
    for (size_t k = 0; k < r.size(); k++) { if (k) o += ","; o += r[k]; }
    cout << "@@R " << i << " " << o << (many ? "]" : "") << endl;
}

int main() {
${tests.join('\n')}
}
`;
}

export const LANGS = {
  js:     { label: 'JavaScript', cm: 'javascript', starter: p => jsStarter(p, false), harness: jsHarness },
  ts:     { label: 'TypeScript', cm: 'typescript', starter: p => jsStarter(p, true), harness: jsHarness },
  python: { label: 'Python', cm: 'python', starter: pyStarter, harness: pyHarness },
  go:     { label: 'Go', cm: 'go', starter: goStarter, harness: goHarness },
  cpp:    { label: 'C++', cm: 'cpp', starter: cppStarter, harness: cppHarness },
};

// ---------------------------------------------------------------- output parsing + comparison
export function parseOutput(text, n) {
  const results = Array(n).fill(null), stdout = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^@@([RE]) (\d+) (.*)$/);
    if (!m) { stdout.push(line); continue; }
    try { results[+m[2]] = m[1] === 'R' ? { got: JSON.parse(m[3]) } : { error: JSON.parse(m[3]) }; }
    catch { results[+m[2]] = { error: 'unparseable output: ' + m[3] }; }
  }
  return { results, stdout: stdout.join('\n').trim() };
}

function equal(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-6;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => equal(x, b[i]));
  return a === b;
}

// Any order that puts every edge's source before its target; [] when the graph has a cycle.
function validTopo(order, [n, edges], expected) {
  if (expected.length === 0) return Array.isArray(order) && order.length === 0;
  if (!Array.isArray(order) || order.length !== n || new Set(order).size !== n) return false;
  const pos = new Map(order.map((v, i) => [v, i]));
  return edges.every(([u, v]) => pos.has(u) && pos.has(v) && pos.get(u) < pos.get(v));
}

export function check(p, test, got) {
  if (p.compare === 'topo') return validTopo(got, test.args, test.expected);
  return equal(got, test.expected);
}

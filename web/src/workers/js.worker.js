// Runs JS/TS harnesses. console.log output becomes the harness stdout.
import { transform } from 'sucrase';

onmessage = ({ data: { lang, src } }) => {
  const out = [];
  console.log = console.info = console.warn = console.error = (...a) =>
    out.push(a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));
  try {
    const code = lang === 'ts' ? transform(src, { transforms: ['typescript'] }).code : src;
    postMessage({ type: 'running' });
    new Function(code)();
  } catch (e) {
    out.push('@@CE ' + (e?.stack || e));
  }
  postMessage({ type: 'done', output: out.join('\n') });
};

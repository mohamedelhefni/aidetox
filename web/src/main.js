import { landingPage, profilePage, grindPage, scratchPage, toolkitPage } from './landing.js';
import { findProblem } from './problems.js';
import { h } from './dom.js';

// Served by `go run ./cmd/aidetox`? Then Go-only days can run the repo's tests locally.
const hasLocalRunner = fetch('api/challenges').then(r => r.ok && r.headers.get('content-type')?.includes('json')).catch(() => false);

async function route() {
  const hash = location.hash.slice(1) || '/';
  const main = document.getElementById('main');
  let page;
  if (hash === '/') page = landingPage();
  else if (hash === '/grind75') page = grindPage();
  else if (hash === '/scratch') page = scratchPage();
  else if (hash === '/toolkit') page = toolkitPage();
  else if (hash === '/profile') page = profilePage();
  else if (hash.startsWith('/p/')) {
    const p = findProblem(hash.slice(3));
    // The editor (CodeMirror + language modes) loads only when a problem is opened.
    page = p ? (await import('./problem.js')).problemPage(p, { hasLocalRunner: await hasLocalRunner }) : null;
  }
  main.replaceChildren(page ?? h(`<div class="track"><h1>Not found</h1><p><a href="#/">Back to the plan</a></p></div>`));
  document.querySelectorAll('nav.top a').forEach(a => (a.getAttribute('href') === '#' + hash ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.body.classList.remove('no-scroll'); // in case we left a problem in full screen
  scrollTo(0, 0);
}

addEventListener('hashchange', route);
route();

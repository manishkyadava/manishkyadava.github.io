import { PROFILE } from './data/profile.js';

const SESSION_KEY = 'mky_booted';
const LINE_DELAY  = 500;   // ms between boot lines
const AUTO_DELAY  = 1500;  // ms after last line before auto-advance

const BOOT_LINES = [
  { text: 'Kernel loaded',              right: '12ms' },
  { text: 'Identity module verified',   right: PROFILE.name },
  { text: 'Experience log indexed',     right: '6 YRS · 3 ORGS' },
  { text: 'Project modules compiled',   right: '4 ACTIVE' },
  { text: 'AI skills matrix loaded',    right: 'CLAUDE · AWS · JAVA' },
  { text: 'Comms link established',     right: 'SECURE' },
];

/**
 * Run the boot sequence animation in `bootScreenEl`, then call `onComplete`.
 * If the session has already booted (sessionStorage flag), calls onComplete immediately.
 *
 * @param {HTMLElement} bootScreenEl
 * @param {Function}    onComplete
 */
export function runBoot(bootScreenEl, onComplete) {
  if (sessionStorage.getItem(SESSION_KEY)) {
    onComplete();
    return;
  }
  sessionStorage.setItem(SESSION_KEY, '1');

  const logEl    = bootScreenEl.querySelector('#boot-log');
  const promptEl = bootScreenEl.querySelector('#boot-prompt');
  const promptTxt = bootScreenEl.querySelector('#boot-prompt-text');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile && promptTxt) {
    promptTxt.textContent = 'TAP TO CONTINUE';
  }

  let done = false;
  let autoTimer = null;

  function advance() {
    if (done) return;
    done = true;
    clearTimeout(autoTimer);
    document.removeEventListener('keydown', advance);
    bootScreenEl.removeEventListener('click',      advance);
    bootScreenEl.removeEventListener('touchstart', advance);
    onComplete();
  }

  document.addEventListener('keydown', advance, { once: false });
  bootScreenEl.addEventListener('click',      advance, { once: false });
  bootScreenEl.addEventListener('touchstart', advance, { once: false });

  BOOT_LINES.forEach((line, i) => {
    setTimeout(() => {
      if (done) return;
      logEl.appendChild(buildLine(line));

      if (i === BOOT_LINES.length - 1) {
        setTimeout(() => {
          if (done) return;
          logEl.appendChild(buildReady());
          promptEl.classList.remove('hidden');
          autoTimer = setTimeout(advance, AUTO_DELAY);
        }, LINE_DELAY);
      }
    }, i * LINE_DELAY);
  });
}

function buildLine({ text, right }) {
  const MAX = 42;
  const dots = '·'.repeat(Math.max(3, MAX - text.length));
  const div = document.createElement('div');
  div.className = 'boot-line';
  div.innerHTML =
    `<span class="boot-check">✓</span>` +
    `<span class="boot-text">${text}</span>` +
    `<span class="boot-dots">${dots}</span>` +
    `<span class="boot-right">${right}</span>`;
  return div;
}

function buildReady() {
  const div = document.createElement('div');
  div.className = 'boot-ready';
  div.innerHTML = `PORTFOLIO READY <span class="cursor">█</span>`;
  return div;
}

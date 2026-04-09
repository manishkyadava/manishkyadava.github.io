# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static ENCOM-themed terminal portfolio at `manishkyadava.github.io` — boot sequence, typed command navigation, 7 sections, mobile-responsive button grid, deployed to GitHub Pages.

**Architecture:** Plain HTML + CSS + ES Modules (no build step, no bundler). Each section is a self-contained command module registered in a central registry — adding a section = adding one file + one import. Data is separated from render logic in `js/data/` so content updates never touch UI code.

**Tech Stack:** HTML5, CSS3 (custom properties), Vanilla JS ES Modules, JetBrains Mono (Google Fonts), GitHub Pages

---

## File Map

```
manishkyadava.github.io/
├── index.html                    # Entry point, full page shell
├── .gitignore
├── css/
│   ├── main.css                  # Variables, base reset, scanline overlay, layout shell
│   ├── terminal.css              # Nav bar, output area, prompt row, echo/error styles
│   ├── sections.css              # Section headers, project cards, timeline, skills, contact
│   └── mobile.css                # ≤768px overrides: button grid, condensed nav, 1-col cards
├── js/
│   ├── main.js                   # Entry: wires boot → terminal handoff
│   ├── boot.js                   # Boot sequence animation + sessionStorage skip logic
│   ├── terminal.js               # Input handling, history, tab-complete, command dispatch
│   ├── utils/
│   │   ├── html.js               # escapeHtml(), el() tag builder, scanIn() animation
│   │   └── scanIn.js             # Staggered line-by-line scan-in animation
│   ├── data/
│   │   ├── profile.js            # Name, bio, contact links, social URLs
│   │   ├── projects.js           # Project objects (id, name, tagline, stack, metrics, detail)
│   │   └── experience.js         # Work history objects (company, role, dates, bullets)
│   └── commands/
│       ├── index.js              # Registry builder — imports all commands, exposes registry map
│       ├── about.js
│       ├── experience.js
│       ├── projects.js           # Handles both `projects` and `projects --detail <id>`
│       ├── skills.js
│       ├── writings.js
│       ├── contact.js
│       └── clear.js              # Built-in: registered for help display, handled in terminal.js
├── tests/
│   └── test.html                 # Browser-based test runner (open in browser, no server needed)
└── assets/
    └── favicon.ico               # 32×32 cyan █ on black — generate with data URI in Task 16
```

---

## Task 1: Repository Scaffold + index.html

**Files:**
- Create: `index.html`
- Create: `.gitignore`
- Create: `css/main.css` (empty)
- Create: `css/terminal.css` (empty)
- Create: `css/sections.css` (empty)
- Create: `css/mobile.css` (empty)
- Create: `js/main.js` (stub)

- [ ] **Step 1: Create the repo directory structure**

```bash
mkdir -p css js/utils js/data js/commands tests assets
touch css/main.css css/terminal.css css/sections.css css/mobile.css
touch js/main.js js/boot.js js/terminal.js
touch js/utils/html.js js/utils/scanIn.js
touch js/data/profile.js js/data/projects.js js/data/experience.js
touch js/commands/index.js js/commands/about.js js/commands/experience.js
touch js/commands/projects.js js/commands/skills.js
touch js/commands/writings.js js/commands/contact.js js/commands/clear.js
```

- [ ] **Step 2: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Manish K Yadava — SDET-3, Team Lead, AI Tooling Engineer">
  <title>Manish K Yadava // Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/terminal.css">
  <link rel="stylesheet" href="css/sections.css">
  <link rel="stylesheet" href="css/mobile.css">
</head>
<body>

  <!-- Boot sequence overlay -->
  <div id="boot-screen" class="boot-screen" aria-live="polite" aria-label="System initializing">
    <div class="boot-corners"></div>
    <div class="boot-header">ENCOM SECURE NETWORK — NODE 7743-A</div>
    <div id="boot-log" class="boot-log" role="log"></div>
    <div id="boot-prompt" class="boot-prompt hidden">
      <span id="boot-prompt-text">PRESS ENTER OR WAIT...</span>
    </div>
  </div>

  <!-- Main terminal (hidden until boot completes) -->
  <div id="terminal" class="terminal hidden">

    <!-- Nav bar — fallback links, identical code path as typing -->
    <nav class="terminal-nav" aria-label="Portfolio sections">
      <span class="nav-brand">MKY://</span>
      <a class="nav-link" href="#" data-command="about" aria-label="Run about command">about</a>
      <a class="nav-link" href="#" data-command="experience" aria-label="Run experience command">experience</a>
      <a class="nav-link" href="#" data-command="projects" aria-label="Run projects command">projects</a>
      <a class="nav-link" href="#" data-command="skills" aria-label="Run skills command">skills</a>
      <a class="nav-link" href="#" data-command="writings" aria-label="Run writings command">writings</a>
      <a class="nav-link" href="#" data-command="contact" aria-label="Run contact command">contact</a>
    </nav>

    <!-- Scrollable output history -->
    <div id="output" class="terminal-output" role="log" aria-live="polite" aria-label="Terminal output"></div>

    <!-- Persistent prompt row -->
    <div class="terminal-input-row">
      <span class="prompt-label" aria-hidden="true">visitor@mky:~$</span>
      <input
        type="text"
        id="cmd-input"
        class="cmd-input"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Enter command"
        placeholder=""
      >
    </div>

    <!-- Mobile command grid — hidden on desktop via CSS -->
    <div class="mobile-commands" aria-label="Quick command buttons">
      <button class="cmd-btn" data-command="about">about</button>
      <button class="cmd-btn" data-command="experience">experience</button>
      <button class="cmd-btn" data-command="projects">projects</button>
      <button class="cmd-btn" data-command="skills">skills</button>
      <button class="cmd-btn" data-command="writings">writings</button>
      <button class="cmd-btn" data-command="contact">contact</button>
    </div>

  </div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Write `.gitignore`**

```
.superpowers/
.DS_Store
```

- [ ] **Step 4: Verify in browser — open `index.html`, page should be blank (no CSS yet)**

- [ ] **Step 5: Init git and commit**

```bash
git init
git add index.html .gitignore css/ js/ tests/ assets/
git commit -m "feat: scaffold project structure and index.html shell"
```

---

## Task 2: CSS Foundation — Variables, Base, Scanlines, Layout

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: Write `css/main.css`**

```css
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root {
  --bg:              #000510;
  --bg-nav:          rgba(0, 5, 20, 0.97);
  --cyan:            #00c8ff;
  --cyan-dim:        rgba(0, 200, 255, 0.5);
  --cyan-ghost:      rgba(0, 200, 255, 0.12);
  --cyan-border:     rgba(0, 200, 255, 0.25);
  --cyan-card-fill:  rgba(0, 200, 255, 0.04);
  --green:           #22ff88;
  --green-dim:       rgba(34, 255, 136, 0.5);
  --text-primary:    rgba(255, 255, 255, 0.85);
  --text-muted:      rgba(255, 255, 255, 0.45);
  --text-cyan:       rgba(0, 200, 255, 0.8);

  --font:            'JetBrains Mono', 'Courier New', monospace;
  --fs-xs:           10px;
  --fs-sm:           11px;
  --fs-md:           13px;
  --fs-lg:           16px;
  --fs-xl:           20px;

  --nav-height:      40px;
  --prompt-height:   46px;
  --mobile-grid-height: 80px;

  --transition:      150ms ease-out;
  --glow-cyan:       0 0 12px rgba(0, 200, 255, 0.6);
  --glow-cyan-sm:    0 0 6px  rgba(0, 200, 255, 0.4);
}

/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  overflow: hidden; /* terminal manages its own scroll */
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font);
  font-size: var(--fs-md);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   SCANLINE OVERLAY — full page, pointer-events: none
   ============================================================ */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 200, 255, 0.012) 3px,
    rgba(0, 200, 255, 0.015) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

/* ============================================================
   UTILITY
   ============================================================ */
.hidden { display: none !important; }

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes scanReveal {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Open `index.html` in browser — background should be `#000510` (near-black), scanlines visible**

- [ ] **Step 3: Commit**

```bash
git add css/main.css
git commit -m "feat: add CSS tokens, reset, scanline overlay"
```

---

## Task 3: Terminal Layout CSS

**Files:**
- Modify: `css/terminal.css`

- [ ] **Step 1: Write `css/terminal.css`**

```css
/* ============================================================
   BOOT SCREEN
   ============================================================ */
.boot-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg);
  z-index: 100;
}

/* Corner bracket decorations */
.boot-corners::before,
.boot-corners::after {
  content: '';
  position: fixed;
  width: 24px;
  height: 24px;
  border-color: rgba(0, 200, 255, 0.35);
  border-style: solid;
}
.boot-corners::before {
  top: 20px; left: 20px;
  border-width: 1px 0 0 1px;
}
.boot-corners::after {
  bottom: 20px; right: 20px;
  border-width: 0 1px 1px 0;
}

.boot-header {
  position: fixed;
  top: 28px;
  left: 0; right: 0;
  text-align: center;
  color: rgba(0, 200, 255, 0.3);
  font-size: var(--fs-xs);
  letter-spacing: 4px;
  text-transform: uppercase;
}

.boot-log {
  width: 100%;
  max-width: 560px;
}

.boot-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: var(--fs-sm);
  line-height: 2;
  animation: scanReveal 0.15s ease-out;
}

.boot-check { color: var(--green); flex-shrink: 0; }
.boot-text  { color: var(--text-cyan); flex-shrink: 0; }
.boot-dots  { color: rgba(0, 200, 255, 0.25); flex: 1; overflow: hidden; white-space: nowrap; }
.boot-right { color: var(--cyan-dim); flex-shrink: 0; font-size: var(--fs-xs); }

.boot-ready {
  margin-top: 16px;
  color: var(--cyan);
  font-size: var(--fs-lg);
  letter-spacing: 3px;
  text-shadow: var(--glow-cyan);
  animation: scanReveal 0.2s ease-out;
}

.boot-prompt {
  margin-top: 14px;
  color: var(--cyan-dim);
  font-size: var(--fs-xs);
  letter-spacing: 2px;
  text-align: center;
}

.cursor {
  animation: blink 1s step-end infinite;
  color: var(--cyan);
}

/* ============================================================
   MAIN TERMINAL LAYOUT
   ============================================================ */
.terminal {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
}

/* NAV BAR */
.terminal-nav {
  flex-shrink: 0;
  height: var(--nav-height);
  background: var(--bg-nav);
  border-bottom: 1px solid var(--cyan-border);
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: none;
}
.terminal-nav::-webkit-scrollbar { display: none; }

.nav-brand {
  color: var(--cyan);
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 2px;
  margin-right: 24px;
  flex-shrink: 0;
  text-shadow: var(--glow-cyan-sm);
}

.nav-link {
  color: rgba(0, 200, 255, 0.35);
  font-family: var(--font);
  font-size: var(--fs-xs);
  text-decoration: none;
  padding: 4px 10px;
  letter-spacing: 1px;
  flex-shrink: 0;
  transition: color var(--transition);
  position: relative;
}
.nav-link:hover  { color: var(--cyan); }
.nav-link.active { color: var(--cyan); }
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 10px; right: 10px;
  height: 1px;
  background: var(--cyan);
  box-shadow: var(--glow-cyan-sm);
}

/* OUTPUT AREA */
.terminal-output {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px;
  scroll-behavior: smooth;
}

/* Thin cyan scrollbar */
.terminal-output::-webkit-scrollbar { width: 3px; }
.terminal-output::-webkit-scrollbar-track { background: transparent; }
.terminal-output::-webkit-scrollbar-thumb { background: var(--cyan-border); border-radius: 2px; }

/* Welcome message shown on init */
.welcome-msg {
  margin-bottom: 20px;
}
.welcome-label {
  color: rgba(0, 200, 255, 0.3);
  font-size: var(--fs-xs);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.welcome-name {
  color: var(--cyan);
  font-size: var(--fs-xl);
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: var(--glow-cyan);
  margin-bottom: 4px;
}
.welcome-role {
  color: rgba(255, 255, 255, 0.55);
  font-size: var(--fs-sm);
  letter-spacing: 1px;
  margin-bottom: 14px;
}
.welcome-hint {
  color: var(--cyan-dim);
  font-size: var(--fs-sm);
  line-height: 2;
}
.welcome-hint .cmd-name { color: var(--green); }

/* COMMAND ECHO & OUTPUT */
.cmd-echo {
  margin-top: 16px;
  margin-bottom: 4px;
  font-size: var(--fs-sm);
}
.cmd-text { color: var(--text-primary); margin-left: 8px; }

.cmd-output {
  margin-bottom: 8px;
}

.cmd-error {
  color: rgba(255, 80, 80, 0.85);
  font-size: var(--fs-sm);
  margin-bottom: 8px;
}

/* PROMPT ROW */
.terminal-input-row {
  flex-shrink: 0;
  height: var(--prompt-height);
  border-top: 1px solid rgba(0, 200, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 28px;
  gap: 10px;
  background: var(--bg);
}

.prompt-label {
  color: var(--green);
  font-size: var(--fs-sm);
  flex-shrink: 0;
  white-space: nowrap;
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: var(--fs-md);
  caret-color: var(--cyan);
}
.cmd-input::placeholder { color: transparent; }

/* MOBILE COMMAND GRID — hidden on desktop */
.mobile-commands {
  display: none;
}
```

- [ ] **Step 2: Verify — open `index.html`, boot screen should fill viewport, dark background, corner brackets visible**

- [ ] **Step 3: Commit**

```bash
git add css/terminal.css
git commit -m "feat: add terminal layout CSS — boot screen, nav, output, prompt"
```

---

## Task 4: Utility Modules

**Files:**
- Modify: `js/utils/html.js`
- Modify: `js/utils/scanIn.js`

- [ ] **Step 1: Write `js/utils/html.js`**

```js
/**
 * Escape user-facing strings before inserting into innerHTML.
 * All data values (commands typed, project names, etc.) must go through this.
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build a tag string. Convenience for template literals.
 * e.g. tag('span', 'boot-check', '✓')
 */
export function tag(element, className, content) {
  return `<${element} class="${className}">${content}</${element}>`;
}
```

- [ ] **Step 2: Write `js/utils/scanIn.js`**

```js
/**
 * Append HTML strings to containerEl one by one with a staggered delay.
 * Each string is wrapped in a <div> and added to the DOM sequentially.
 *
 * @param {HTMLElement} containerEl  - Element to append lines into
 * @param {string[]}    lines        - Array of HTML strings (one per line/block)
 * @param {number}      delayMs      - Gap between lines in milliseconds (default 40)
 * @returns {Promise<void>}          - Resolves after the last line is appended
 */
export function scanIn(containerEl, lines, delayMs = 40) {
  return new Promise((resolve) => {
    lines.forEach((html, i) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.innerHTML = html;
        containerEl.appendChild(div);
        // Keep output scrolled to bottom
        const output = document.getElementById('output');
        if (output) output.scrollTop = output.scrollHeight;
        if (i === lines.length - 1) resolve();
      }, i * delayMs);
    });
    if (lines.length === 0) resolve();
  });
}
```

- [ ] **Step 3: Write browser tests for utilities in `tests/test.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portfolio Tests</title>
  <style>
    body { font-family: monospace; background: #000510; color: #ccc; padding: 20px; }
    .pass { color: #22ff88; }
    .fail { color: #ff5555; }
    .suite { color: #00c8ff; margin-top: 16px; font-weight: bold; }
  </style>
</head>
<body>
<div id="results"></div>
<div id="scan-target" style="display:none"></div>
<script type="module">
  import { escapeHtml, tag } from '../js/utils/html.js';
  import { scanIn } from '../js/utils/scanIn.js';

  const results = document.getElementById('results');

  function suite(name) {
    results.innerHTML += `<div class="suite">${name}</div>`;
  }

  function assert(description, actual, expected) {
    const pass = actual === expected;
    results.innerHTML += `<div class="${pass ? 'pass' : 'fail'}">
      ${pass ? '✓' : '✗'} ${description}
      ${pass ? '' : `<br>&nbsp;&nbsp;Expected: ${JSON.stringify(expected)}<br>&nbsp;&nbsp;Got:      ${JSON.stringify(actual)}`}
    </div>`;
  }

  // escapeHtml
  suite('escapeHtml');
  assert('escapes &',  escapeHtml('a & b'),       'a &amp; b');
  assert('escapes <',  escapeHtml('<script>'),     '&lt;script&gt;');
  assert('escapes >',  escapeHtml('a > b'),        'a &gt; b');
  assert('escapes "',  escapeHtml('"hello"'),      '&quot;hello&quot;');
  assert('passthrough plain text', escapeHtml('hello world'), 'hello world');

  // tag
  suite('tag');
  assert('builds tag', tag('span', 'foo', 'bar'), '<span class="foo">bar</span>');

  // scanIn
  suite('scanIn');
  const target = document.getElementById('scan-target');
  target.innerHTML = '';
  await scanIn(target, ['<span>line1</span>', '<span>line2</span>'], 10);
  assert('scanIn appends 2 divs', target.children.length, 2);
  assert('scanIn first child content', target.children[0].innerHTML, '<span>line1</span>');
</script>
</body>
</html>
```

- [ ] **Step 4: Open `tests/test.html` in browser — all tests should show green ✓**

- [ ] **Step 5: Commit**

```bash
git add js/utils/html.js js/utils/scanIn.js tests/test.html
git commit -m "feat: add html utility and scanIn animation helper with browser tests"
```

---

## Task 5: Data Files

**Files:**
- Modify: `js/data/profile.js`
- Modify: `js/data/projects.js`
- Modify: `js/data/experience.js`

- [ ] **Step 1: Write `js/data/profile.js`**

```js
export const PROFILE = {
  name:     'MANISH K YADAVA',
  role:     'SDET-3 · TEAM LEAD · AI TOOLING PIONEER',
  location: 'Bangalore, India',
  bio: [
    'I build AI-augmented testing systems that make quality engineering faster and smarter.',
    'Currently at Jumio leading an SDET team, architecting LLM-powered tooling that turns',
    'days of manual work into minutes — without sacrificing test integrity.',
  ],
  links: [
    { label: 'email',    href: 'mailto:manishkyadava19@gmail.com',                        display: 'manishkyadava19@gmail.com' },
    { label: 'linkedin', href: 'https://www.linkedin.com/in/manish-k-yadava-36a470128/', display: 'linkedin.com/in/manish-k-yadava' },
    { label: 'github',   href: 'https://github.com/manishkyadava',                       display: 'github.com/manishkyadava' },
    { label: 'medium',   href: 'https://medium.com/@manishkyadava7/',                    display: 'medium.com/@manishkyadava7' },
  ],
  skills: {
    'Languages':    [
      { name: 'Java 21',     level: 5 },
      { name: 'Python',      level: 4 },
      { name: 'TypeScript',  level: 3 },
      { name: 'Bash',        level: 4 },
      { name: 'SQL',         level: 3 },
    ],
    'Testing':      [
      { name: 'TestNG',       level: 5 },
      { name: 'Playwright',   level: 4 },
      { name: 'RestAssured',  level: 4 },
      { name: 'JUnit',        level: 4 },
      { name: 'Selenium',     level: 3 },
    ],
    'Cloud & Infra': [
      { name: 'AWS Lambda',   level: 4 },
      { name: 'DynamoDB',     level: 4 },
      { name: 'SNS/SQS',      level: 4 },
      { name: 'Jenkins',      level: 4 },
      { name: 'GitHub',       level: 5 },
    ],
    'AI & LLMs':    [
      { name: 'Claude/Anthropic', level: 5 },
      { name: 'LangChain',        level: 4 },
      { name: 'AWS Bedrock',      level: 3 },
      { name: 'MCP Servers',      level: 4 },
    ],
    'Frontend':     [
      { name: 'React 18',     level: 3 },
      { name: 'Vite',         level: 3 },
      { name: 'Material UI',  level: 3 },
    ],
  },
  writings: [
    {
      title: 'TestRail Integration with Automation Framework',
      year:  '2024',
      href:  'https://medium.com/@manishkyadava7/testrail-integration-with-automation-framework-4644c2c23701',
    },
  ],
};
```

- [ ] **Step 2: Write `js/data/experience.js`**

```js
export const EXPERIENCE = [
  {
    id:       'jumio',
    company:  'JUMIO CORPORATION',
    role:     'SDET-3 · Team Lead',
    period:   'Jun 2024 – Present',
    location: 'Bangalore, IN',
    brightness: 'high',   // controls timeline left-border colour
    summary:  'Leading SDET team; building AI-augmented testing infrastructure at scale.',
    bullets: [
      'Built TestGenie — full-stack AI test management SaaS; 70% doc effort reduction, 3× faster test creation',
      'Led team of 2 SDETs; mentored 5 engineers on AI-assisted testing practices',
      'Architected event-driven test framework covering 15+ microservices — zero production escapes',
      'Built Bulldozer: LangChain pipeline reverse-engineering PRDs for 73+ microservices (69% coverage)',
      'Standardised Claude Code toolkit across QA, Dev, PM teams with custom skills and MCP servers',
      'Scaled UI automation coverage from 10% to 50% in 3 weeks; 40% reduction in manual testing overhead',
      '100% functional coverage for Jumio Premium across 25+ merchant configurations',
    ],
  },
  {
    id:       'acko',
    company:  'ACKO',
    role:     'SDET-1 → SDET-2',
    period:   'Aug 2021 – May 2024',
    location: 'Bangalore, IN',
    brightness: 'mid',
    summary:  'Built cross-platform test infrastructure; led pricing engine migration QA.',
    bullets: [
      'Architected test strategy for bike pricing grid migration: 500+ scenarios, 95% time reduction (3 days → 30 min)',
      'Zero production defects post-migration',
      'Built unified regression suite for 8 broker platforms — 90% API coverage, 50+ scenarios',
      'Created 10+ Postman collections; 60% reduction in integration ramp-up for 15+ team members',
      'Integrated TestRail + Google Sheets + Slack; 80% reduction in manual communication overhead',
    ],
  },
  {
    id:       'capgemini',
    company:  'CAPGEMINI',
    role:     'Analyst → Senior Analyst → Associate Consultant',
    period:   'Nov 2018 – Jul 2021',
    location: 'Bangalore, IN',
    brightness: 'low',
    summary:  'Delivered automation frameworks and led training for enterprise QA projects.',
    bullets: [
      'Built Jasmine/JavaScript framework for Universal Studios project — 300+ test cases, 95% reliability',
      'Migrated 150+ Ranorex scenarios — zero functionality loss',
      'Designed and delivered Ranorex training for 12 team members; 100% certification in 6 weeks',
      'Produced executive reports showing 40% reduction in manual testing costs',
    ],
  },
];
```

- [ ] **Step 3: Write `js/data/projects.js`**

```js
export const PROJECTS = [
  {
    id:       'testgenie',
    name:     'TESTGENIE',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Full-stack AI test management SaaS',
    stack:    ['Java 21', 'Quarkus', 'AWS Lambda', 'DynamoDB', 'React 18', 'AWS Bedrock', 'TypeScript'],
    metrics: [
      { value: '70%',  label: 'DOC EFFORT ↓' },
      { value: '3×',   label: 'TEST SPEED ↑' },
      { value: '5+',   label: 'TEAMS USING' },
    ],
    problem:
      'Test documentation was entirely manual — engineers spent 70% of cycle time writing test cases ' +
      'instead of executing them. No traceability from Jira requirements to test coverage.',
    approach:
      'Serverless backend (Java 21 + Quarkus on AWS Lambda) with single-table DynamoDB design for ' +
      'low-latency access patterns. AWS Bedrock drives AI test case generation from Jira requirement ' +
      'context. React 18 + Material UI frontend with custom productivity dashboards.',
    challenges: [
      'Single-table DynamoDB design required upfront access-pattern modelling — GSI patterns needed 3 iterations',
      'AWS Bedrock prompt engineering for deterministic test case structure (not free-form prose)',
      'Cold-start latency on Lambda required SnapStart + provisioned concurrency tuning',
    ],
    links: [],
  },
  {
    id:       'bulldozer',
    name:     'BULLDOZER',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'LangChain AI documentation pipeline',
    stack:    ['Python', 'LangChain', 'Claude', 'Pydantic', 'Jira API', 'Confluence API'],
    metrics: [
      { value: '73+',   label: 'MICROSERVICES' },
      { value: '69%',   label: 'KNOWLEDGE COV.' },
      { value: 'mins',  label: 'VS DAYS BEFORE' },
    ],
    problem:
      'No one had documented 73+ microservices across 3 teams. New engineers had zero onboarding ' +
      'material. PRDs, API specs, and test plans had to be reverse-engineered from source code manually.',
    approach:
      'LCEL pipeline: ingest service code → Claude synthesises PRD → generate OpenAPI spec → ' +
      'produce test plan → push to Confluence. Pydantic models enforce structured output at each stage. ' +
      'Deterministic, not agentic — each step is a typed transformation.',
    challenges: [
      'Keeping Pydantic output schemas stable across different Claude response styles',
      'Jira/Confluence API rate limiting required backoff + resumable batch processing',
      'Prompt chaining: later stages depend on earlier outputs — error propagation required careful handling',
    ],
    links: [],
  },
  {
    id:       'evtframework',
    name:     'EVENT-DRIVEN TEST FRAMEWORK',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Java framework for AWS SNS/SQS microservice testing',
    stack:    ['Java', 'TestNG', 'AWS SNS', 'AWS SQS', 'AWS Bedrock', 'Jenkins'],
    metrics: [
      { value: '15+',  label: 'MICROSERVICES' },
      { value: '0',    label: 'PROD ESCAPES' },
      { value: '100%', label: 'FILTER COVERAGE' },
    ],
    problem:
      'Testing 15+ event-driven microservices required publishing SNS events, waiting for SQS ' +
      'processing, and asserting downstream state — all done manually per test cycle.',
    approach:
      'Reusable Java test library: SNS publisher + SQS async poller with configurable timeouts, ' +
      'SNS filter policy validator, mock service harness, and AWS Bedrock for parsing ' +
      'unstructured event payloads. Jenkins pipeline for full regression on every PR.',
    challenges: [
      'SQS eventual consistency: async polling with configurable backoff to avoid flaky timeouts',
      'SNS filter policy validation required simulating filter evaluation locally (no AWS API for this)',
      'Bedrock integration for event parsing needed prompt templating to handle schema variations',
    ],
    links: [],
  },
  {
    id:       'cctoolkit',
    name:     'CLAUDE CODE TOOLKIT',
    org:      'JUMIO',
    status:   'ACTIVE',
    tagline:  'Team-wide AI tooling standardisation via Claude Code',
    stack:    ['Bash', 'Claude Code', 'MCP Servers', 'Anthropic API', 'YAML'],
    metrics: [
      { value: '5+',    label: 'CUSTOM SKILLS' },
      { value: '3',     label: 'TEAMS ONBOARDED' },
      { value: '1-cmd', label: 'INSTALL' },
    ],
    problem:
      'Each engineer was using Claude ad-hoc with inconsistent prompts and no shared context. ' +
      'QA, Dev, and PM teams had no common AI workflow — value was siloed per individual.',
    approach:
      'Version-controlled toolkit: custom Claude Code skills (/generate-test-cases, /test-plan, ' +
      '/product-manager, /update-automation-status, /flowable-dev), MCP server configs ' +
      '(mcp-atlassian, playwright, context7), and a one-command idempotent Bash installer.',
    challenges: [
      'Making skills portable across machines with different project structures required relative-path conventions',
      'Multi-agent patterns (Opus for synthesis, Sonnet for scanning) needed careful permission modelling',
      'Onboarding PM team required skill UX simplification — no terminal familiarity assumed',
    ],
    links: [],
  },
];
```

- [ ] **Step 4: Add data tests to `tests/test.html`**

```html
<!-- Add inside the <script type="module"> block, after existing tests -->
```

```js
// Add these imports at top of existing script:
import { PROFILE }    from '../js/data/profile.js';
import { PROJECTS }   from '../js/data/projects.js';
import { EXPERIENCE } from '../js/data/experience.js';

// Add these test suites after existing tests:
suite('PROFILE data shape');
assert('has name',       typeof PROFILE.name,     'string');
assert('has links array', Array.isArray(PROFILE.links), true);
assert('has skills obj',  typeof PROFILE.skills,  'object');

suite('PROJECTS data shape');
assert('4 projects',     PROJECTS.length,          4);
assert('first id',       PROJECTS[0].id,           'testgenie');
assert('metrics array',  Array.isArray(PROJECTS[0].metrics), true);
assert('has problem',    typeof PROJECTS[0].problem, 'string');
assert('has challenges', Array.isArray(PROJECTS[0].challenges), true);

suite('EXPERIENCE data shape');
assert('3 entries',      EXPERIENCE.length,          3);
assert('first id',       EXPERIENCE[0].id,           'jumio');
assert('has bullets',    Array.isArray(EXPERIENCE[0].bullets), true);
```

- [ ] **Step 5: Open `tests/test.html` — all data shape tests should pass (green)**

- [ ] **Step 6: Commit**

```bash
git add js/data/profile.js js/data/projects.js js/data/experience.js tests/test.html
git commit -m "feat: add data files for profile, projects, and experience"
```

---

## Task 6: Boot Sequence

**Files:**
- Modify: `js/boot.js`

- [ ] **Step 1: Write `js/boot.js`**

```js
import { PROFILE } from './data/profile.js';

const SESSION_KEY = 'mky_booted';
const LINE_DELAY  = 200;   // ms between boot lines
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
    bootScreenEl.removeEventListener('click', advance);
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
  // Pad dots so right column aligns regardless of text length
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
```

- [ ] **Step 2: Write `js/main.js`**

```js
import { runBoot }      from './boot.js';
import { initTerminal } from './terminal.js';

const bootScreen = document.getElementById('boot-screen');
const terminal   = document.getElementById('terminal');

runBoot(bootScreen, () => {
  bootScreen.classList.add('hidden');
  terminal.classList.remove('hidden');
  initTerminal();
});
```

- [ ] **Step 3: Open `index.html` in browser — boot sequence should play, all 6 lines appear, then "PORTFOLIO READY █", then main terminal appears after ~1.5s (or immediately on keypress)**

- [ ] **Step 4: Reload page — boot sequence should NOT replay (sessionStorage skip)**

- [ ] **Step 5: Open in a new incognito window — boot should replay**

- [ ] **Step 6: Commit**

```bash
git add js/boot.js js/main.js
git commit -m "feat: boot sequence with sessionStorage skip and mobile tap-to-continue"
```

---

## Task 7: Terminal Core

**Files:**
- Modify: `js/terminal.js`

- [ ] **Step 1: Write `js/terminal.js`**

```js
import { registry } from './commands/index.js';
import { escapeHtml } from './utils/html.js';
import { PROFILE } from './data/profile.js';

const HISTORY_KEY = 'mky_history';
const MAX_HISTORY = 50;

export function initTerminal() {
  const input  = document.getElementById('cmd-input');
  const output = document.getElementById('output');

  let history      = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
  let historyIndex = -1;

  // Show welcome message
  renderWelcome(output);

  // Focus input on load
  input.focus();

  // Re-focus on click anywhere in terminal (but not on links/buttons/cards)
  document.getElementById('terminal').addEventListener('click', (e) => {
    if (!e.target.closest('a, button, [role="button"], .project-card, .exp-card')) {
      input.focus();
    }
  });

  // Nav link clicks → same code path as typing
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      runCommand(link.dataset.command);
    });
  });

  // Mobile command buttons → same code path
  document.querySelectorAll('.cmd-btn').forEach(btn => {
    btn.addEventListener('click', () => runCommand(btn.dataset.command));
  });

  // Keyboard handling
  input.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Enter': {
        const raw = input.value.trim();
        if (!raw) return;
        pushHistory(raw);
        historyIndex = -1;
        input.value = '';
        runCommand(raw);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        } else {
          historyIndex = -1;
          input.value  = '';
        }
        break;
      }
      case 'Tab': {
        e.preventDefault();
        const matches = Object.keys(registry).filter(n => n.startsWith(input.value));
        if (matches.length === 1) input.value = matches[0];
        break;
      }
    }
  });

  /**
   * Parse raw input, echo it, dispatch to registry, scroll to bottom.
   * Exposed on window so command modules can trigger sub-commands
   * (e.g., project card click → projects --detail testgenie).
   */
  function runCommand(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    // Echo
    const echoEl = document.createElement('div');
    echoEl.className = 'cmd-echo';
    echoEl.innerHTML =
      `<span class="prompt-label">visitor@mky:~$</span>` +
      `<span class="cmd-text"> ${escapeHtml(raw)}</span>`;
    output.appendChild(echoEl);

    // Built-in: clear (needs to reset the entire output div)
    if (cmd === 'clear') {
      output.innerHTML = '';
      setActiveNav('');
      return;
    }

    // Dispatch to registry
    const outEl = document.createElement('div');
    outEl.className = 'cmd-output';
    output.appendChild(outEl);

    if (registry[cmd]) {
      setActiveNav(cmd);
      registry[cmd].render(args, outEl);
    } else {
      outEl.innerHTML =
        `<div class="cmd-error">command not found: ${escapeHtml(cmd)}<br>` +
        `Type <span class="green">help</span> for available commands.</div>`;
    }

    output.scrollTop = output.scrollHeight;
  }

  // Expose for use by command modules (project/experience card clicks)
  window.mkyRun = runCommand;

  function pushHistory(cmd) {
    history = [cmd, ...history.filter(h => h !== cmd)].slice(0, MAX_HISTORY);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function setActiveNav(cmd) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.command === cmd);
    });
  }
}

function renderWelcome(output) {
  output.innerHTML = `
    <div class="welcome-msg">
      <div class="welcome-label">ENCOM SECURE NETWORK — AUTHENTICATED</div>
      <div class="welcome-name">${PROFILE.name}</div>
      <div class="welcome-role">${PROFILE.role}</div>
      <div class="welcome-hint">
        Type a command to explore this system.<br>
        Type <span class="cmd-name">help</span> to list all available commands.
      </div>
    </div>`;
}
```

- [ ] **Step 2: Open `index.html`, after boot: welcome message should display, prompt should be focussed**

- [ ] **Step 3: Add terminal behaviour tests to `tests/test.html`**

```js
// Add at end of existing test script block

suite('terminal command parsing');
// Test escapeHtml in runCommand context
assert('escapeHtml prevents XSS', escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
```

- [ ] **Step 4: Commit**

```bash
git add js/terminal.js
git commit -m "feat: terminal core — input handling, history, tab-complete, command dispatch"
```

---

## Task 8: Command Registry + help

**Files:**
- Modify: `js/commands/index.js`
- Modify: `js/commands/clear.js`

- [ ] **Step 1: Write `js/commands/clear.js`** (registry entry only — actual logic is in terminal.js)

```js
// clear is handled as a built-in in terminal.js (it resets the entire output div).
// This entry exists solely so `help` can list it.
export default {
  name:        'clear',
  description: 'Clear the terminal output',
  render() {}, // no-op: terminal.js intercepts this before reaching here
};
```

- [ ] **Step 2: Write `js/commands/index.js`**

```js
import about      from './about.js';
import experience from './experience.js';
import projects   from './projects.js';
import skills     from './skills.js';
import writings   from './writings.js';
import contact    from './contact.js';
import clear      from './clear.js';

/** All registered commands. Key = command name. */
export const registry = {};

// Register content commands
[about, experience, projects, skills, writings, contact, clear].forEach(cmd => {
  registry[cmd.name] = cmd;
});

// Build `help` inline — needs access to the completed registry
registry.help = {
  name:        'help',
  description: 'List all available commands',
  render(_args, outputEl) {
    const sorted = Object.values(registry).sort((a, b) => a.name.localeCompare(b.name));
    const lines = sorted.map(
      cmd => `<div class="help-line">` +
             `<span class="help-cmd">${cmd.name}</span>` +
             `<span class="help-sep">→</span>` +
             `<span class="help-desc">${cmd.description}</span>` +
             `</div>`
    );
    outputEl.innerHTML =
      `<div class="section-header">▸ AVAILABLE COMMANDS</div>` +
      lines.join('');
  },
};
```

- [ ] **Step 3: Stub all command files so imports don't fail (they'll be fleshed out in later tasks)**

Each file needs at minimum a default export. Write these stubs now:

`js/commands/about.js`:
```js
export default { name: 'about', description: 'Display identity profile', render(_a, el) { el.textContent = 'about — coming soon'; } };
```

`js/commands/experience.js`:
```js
export default { name: 'experience', description: 'Show mission log', render(_a, el) { el.textContent = 'experience — coming soon'; } };
```

`js/commands/projects.js`:
```js
export default { name: 'projects', description: 'List project modules. Use --detail <id> for full view', render(_a, el) { el.textContent = 'projects — coming soon'; } };
```

`js/commands/skills.js`:
```js
export default { name: 'skills', description: 'Display tech matrix', render(_a, el) { el.textContent = 'skills — coming soon'; } };
```

`js/commands/writings.js`:
```js
export default { name: 'writings', description: 'List publications', render(_a, el) { el.textContent = 'writings — coming soon'; } };
```

`js/commands/contact.js`:
```js
export default { name: 'contact', description: 'Show contact information', render(_a, el) { el.textContent = 'contact — coming soon'; } };
```

- [ ] **Step 4: Open `index.html`, type `help` → should list all 8 commands with descriptions**

- [ ] **Step 5: Type `clear` → output should wipe. Type `unknown` → error message should appear**

- [ ] **Step 6: Commit**

```bash
git add js/commands/
git commit -m "feat: command registry, help command, clear built-in, stub commands"
```

---

## Task 9: sections.css

**Files:**
- Modify: `css/sections.css`

- [ ] **Step 1: Write `css/sections.css`**

```css
/* ============================================================
   SHARED SECTION ELEMENTS
   ============================================================ */
.section-header {
  color: rgba(0, 200, 255, 0.4);
  font-size: var(--fs-xs);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 14px;
  margin-top: 4px;
}

.green  { color: var(--green); }
.cyan   { color: var(--cyan); }
.muted  { color: var(--text-muted); }

/* ============================================================
   HELP COMMAND
   ============================================================ */
.help-line {
  display: flex;
  gap: 12px;
  font-size: var(--fs-sm);
  line-height: 2.2;
  align-items: baseline;
}
.help-cmd  { color: var(--cyan); min-width: 90px; flex-shrink: 0; }
.help-sep  { color: rgba(0, 200, 255, 0.25); }
.help-desc { color: var(--text-muted); }

/* ============================================================
   ABOUT COMMAND
   ============================================================ */
.about-name { color: var(--cyan); font-size: var(--fs-lg); font-weight: 700; letter-spacing: 3px; text-shadow: var(--glow-cyan); margin-bottom: 4px; }
.about-role { color: rgba(255,255,255,0.55); font-size: var(--fs-sm); letter-spacing: 1px; margin-bottom: 12px; }
.about-bio  { color: var(--text-muted); font-size: var(--fs-sm); line-height: 1.8; margin-bottom: 14px; }

.about-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.about-link  {
  color: var(--cyan);
  text-decoration: none;
  font-size: var(--fs-sm);
  border: 1px solid var(--cyan-border);
  padding: 3px 10px;
  border-radius: 2px;
  transition: all var(--transition);
}
.about-link:hover {
  background: var(--cyan-ghost);
  box-shadow: var(--glow-cyan-sm);
}
.about-link-label { color: var(--cyan-dim); margin-right: 4px; }

/* ============================================================
   EXPERIENCE COMMAND
   ============================================================ */
.timeline { padding-left: 4px; }

.exp-entry {
  border-left: 2px solid;
  padding-left: 14px;
  margin-bottom: 18px;
  position: relative;
  cursor: pointer;
  transition: all var(--transition);
}
.exp-entry::before {
  content: '';
  position: absolute;
  left: -4px; top: 6px;
  width: 6px; height: 6px;
  background: currentColor;
  border-radius: 50%;
}
.exp-entry.brightness-high  { border-color: var(--cyan); color: var(--cyan); }
.exp-entry.brightness-mid   { border-color: rgba(0,200,255,0.45); color: rgba(0,200,255,0.45); }
.exp-entry.brightness-low   { border-color: rgba(0,200,255,0.2); color: rgba(0,200,255,0.2); }

.exp-entry:hover { opacity: 0.85; }

.exp-company { font-size: var(--fs-md); font-weight: 700; letter-spacing: 1px; }
.exp-role    { color: rgba(255,255,255,0.5); font-size: var(--fs-xs); margin-top: 2px; }
.exp-summary { color: var(--text-muted); font-size: var(--fs-xs); margin-top: 4px; }
.exp-expand  { color: rgba(0,200,255,0.3); font-size: var(--fs-xs); margin-top: 4px; }

/* Expanded bullet list */
.exp-bullets { margin-top: 8px; padding-left: 0; list-style: none; }
.exp-bullets li { color: var(--text-muted); font-size: var(--fs-xs); line-height: 1.9; }
.exp-bullets li::before { content: '↳ '; color: var(--cyan-dim); }

/* ============================================================
   PROJECTS COMMAND
   ============================================================ */
.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.project-card {
  border: 1px solid var(--cyan-border);
  background: var(--cyan-card-fill);
  padding: 14px;
  border-radius: 3px;
  cursor: pointer;
  transition: all var(--transition);
}
.project-card:hover,
.project-card:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 16px rgba(0,200,255,0.12);
  outline: none;
}

.card-header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.card-name    { color: var(--cyan); font-size: var(--fs-sm); font-weight: 700; letter-spacing: 1px; text-shadow: var(--glow-cyan-sm); }
.card-badge   { color: var(--green); font-size: var(--fs-xs); background: rgba(34,255,136,0.1); border: 1px solid rgba(34,255,136,0.3); padding: 1px 6px; border-radius: 2px; flex-shrink: 0; }
.card-tagline { color: var(--text-muted); font-size: var(--fs-xs); margin-bottom: 8px; }
.card-metrics { display: flex; gap: 12px; margin-bottom: 8px; }
.metric       { color: var(--cyan-dim); font-size: var(--fs-xs); }
.card-tags    { display: flex; flex-wrap: wrap; gap: 4px; }
.tag          { color: var(--cyan); background: rgba(0,200,255,0.06); border: 1px solid rgba(0,200,255,0.18); padding: 1px 6px; border-radius: 2px; font-size: var(--fs-xs); }

/* Project detail view */
.project-detail { border: 1px solid var(--cyan-border); background: var(--cyan-card-fill); padding: 18px; border-radius: 3px; }
.detail-header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.detail-name    { color: var(--cyan); font-size: var(--fs-xl); font-weight: 700; letter-spacing: 2px; text-shadow: var(--glow-cyan); }
.detail-org     { color: var(--text-muted); font-size: var(--fs-xs); margin-top: 3px; }
.detail-divider { border: none; border-top: 1px solid var(--cyan-border); margin: 12px 0; }

.detail-section       { margin-bottom: 14px; }
.detail-section-label { color: var(--cyan-dim); font-size: var(--fs-xs); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
.detail-section-body  { color: var(--text-muted); font-size: var(--fs-sm); line-height: 1.8; }

.detail-challenges { padding-left: 0; list-style: none; }
.detail-challenges li { color: var(--text-muted); font-size: var(--fs-sm); line-height: 1.9; }
.detail-challenges li::before { content: '▸ '; color: var(--cyan-dim); }

.detail-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.detail-metric  { background: rgba(0,200,255,0.06); border: 1px solid var(--cyan-border); padding: 8px; text-align: center; border-radius: 2px; }
.detail-metric-value { color: var(--green); font-size: var(--fs-lg); font-weight: 700; }
.detail-metric-label { color: var(--cyan-dim); font-size: var(--fs-xs); letter-spacing: 1px; }

.detail-stack   { display: flex; flex-wrap: wrap; gap: 5px; }
.detail-back    { margin-top: 14px; color: var(--cyan-dim); font-size: var(--fs-xs); }
.detail-back span { color: var(--green); }

/* ============================================================
   SKILLS COMMAND
   ============================================================ */
.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.skill-category       { margin-bottom: 4px; }
.skill-category-label { color: var(--cyan); font-size: var(--fs-xs); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid var(--cyan-border); padding-bottom: 4px; }
.skill-row            { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.skill-name           { color: var(--text-muted); font-size: var(--fs-xs); min-width: 110px; flex-shrink: 0; }
.skill-bar            { display: flex; gap: 2px; }
.skill-block          { width: 8px; height: 8px; border-radius: 1px; }
.skill-block.filled   { background: var(--cyan); box-shadow: 0 0 4px rgba(0,200,255,0.4); }
.skill-block.empty    { background: rgba(0,200,255,0.12); }

/* ============================================================
   WRITINGS COMMAND
   ============================================================ */
.writings-list { display: flex; flex-direction: column; gap: 6px; }
.writing-row   {
  display: flex; align-items: baseline; gap: 12px;
  font-size: var(--fs-sm); line-height: 2;
  color: var(--text-muted);
}
.writing-perms { color: rgba(0,200,255,0.25); font-size: var(--fs-xs); flex-shrink: 0; }
.writing-year  { color: rgba(0,200,255,0.3); font-size: var(--fs-xs); flex-shrink: 0; }
.writing-title { color: var(--text-muted); flex: 1; }
.writing-link  {
  color: var(--cyan); text-decoration: none; font-size: var(--fs-xs);
  border: 1px solid var(--cyan-border); padding: 1px 7px; border-radius: 2px;
  flex-shrink: 0; transition: all var(--transition);
}
.writing-link:hover { background: var(--cyan-ghost); }

/* ============================================================
   CONTACT COMMAND
   ============================================================ */
.contact-list  { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.contact-row   { display: flex; align-items: baseline; gap: 0; font-size: var(--fs-sm); line-height: 2.2; }
.contact-label { color: var(--cyan-dim); min-width: 90px; flex-shrink: 0; font-size: var(--fs-xs); }
.contact-value { color: var(--text-muted); flex: 1; }
.contact-link  {
  color: var(--cyan); text-decoration: none; font-size: var(--fs-xs);
  border: 1px solid var(--cyan-border); padding: 1px 7px; border-radius: 2px;
  margin-left: 10px; flex-shrink: 0; transition: all var(--transition);
}
.contact-link:hover { background: var(--cyan-ghost); }
```

- [ ] **Step 2: Commit**

```bash
git add css/sections.css
git commit -m "feat: section styles — help, about, experience, projects, skills, writings, contact"
```

---

## Task 10: `about` Command

**Files:**
- Modify: `js/commands/about.js`

- [ ] **Step 1: Replace stub with full implementation**

```js
import { PROFILE } from '../data/profile.js';
import { scanIn }  from '../utils/scanIn.js';

export default {
  name:        'about',
  description: 'Display identity profile',
  render(_args, outputEl) {
    const bioLines = PROFILE.bio.map(l => `<span>${l}</span>`).join(' ');
    const links    = PROFILE.links.map(renderLink).join('');

    const lines = [
      `<div class="section-header">▸ IDENTITY MODULE</div>`,
      `<div class="about-name">${PROFILE.name}</div>`,
      `<div class="about-role">${PROFILE.role}</div>`,
      `<div class="about-bio">${bioLines}</div>`,
      `<div class="about-links">${links}</div>`,
    ];

    scanIn(outputEl, lines, 50);
  },
};

function renderLink({ label, href, display }) {
  return `<a class="about-link" href="${href}" target="_blank" rel="noopener noreferrer">` +
         `<span class="about-link-label">[${label}]</span>${display}` +
         `</a>`;
}
```

- [ ] **Step 2: Open browser, type `about` → identity module should scan in, links should be clickable and open in new tab**

- [ ] **Step 3: Commit**

```bash
git add js/commands/about.js
git commit -m "feat: about command — identity module with bio and links"
```

---

## Task 11: `experience` Command

**Files:**
- Modify: `js/commands/experience.js`

- [ ] **Step 1: Replace stub with full implementation**

```js
import { EXPERIENCE } from '../data/experience.js';
import { escapeHtml } from '../utils/html.js';
import { scanIn }     from '../utils/scanIn.js';

export default {
  name:        'experience',
  description: 'Show mission log. Use --detail <id> for full bullet list',
  render(args, outputEl) {
    if (args[0] === '--detail' && args[1]) {
      renderDetail(args[1], outputEl);
    } else {
      renderList(outputEl);
    }
  },
};

function renderList(outputEl) {
  const lines = [
    `<div class="section-header">▸ MISSION LOG — ${EXPERIENCE.length} ASSIGNMENTS</div>`,
    `<div class="timeline">${EXPERIENCE.map(entryCard).join('')}</div>`,
  ];
  scanIn(outputEl, lines, 60);

  // Bind clicks after render
  setTimeout(() => {
    outputEl.querySelectorAll('.exp-entry').forEach(card => {
      card.addEventListener('click', () => {
        window.mkyRun(`experience --detail ${card.dataset.id}`);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') window.mkyRun(`experience --detail ${card.dataset.id}`);
      });
    });
  }, 200);
}

function entryCard(exp) {
  return `<div class="exp-entry brightness-${exp.brightness}" data-id="${exp.id}" role="button" tabindex="0">
    <div class="exp-company">${exp.company}</div>
    <div class="exp-role">${exp.role} · ${exp.period}</div>
    <div class="exp-summary">${exp.summary}</div>
    <div class="exp-expand">click to expand ↓</div>
  </div>`;
}

function renderDetail(id, outputEl) {
  const exp = EXPERIENCE.find(e => e.id === id.toLowerCase());
  if (!exp) {
    outputEl.innerHTML = `<div class="cmd-error">entry not found: ${escapeHtml(id)}. Type 'experience' to list entries.</div>`;
    return;
  }

  const bullets = exp.bullets.map(b => `<li>${b}</li>`).join('');
  const lines = [
    `<div class="section-header">▸ ${exp.company}</div>`,
    `<div class="exp-role" style="margin-bottom:12px">${exp.role} · ${exp.period} · ${exp.location}</div>`,
    `<ul class="exp-bullets">${bullets}</ul>`,
    `<div class="detail-back" style="margin-top:12px">← type <span>experience</span> to return</div>`,
  ];
  scanIn(outputEl, lines, 40);
}
```

- [ ] **Step 2: Type `experience` → 3 timeline entries scan in, each clickable**

- [ ] **Step 3: Click Jumio entry → bullets scan in with full detail**

- [ ] **Step 4: Commit**

```bash
git add js/commands/experience.js
git commit -m "feat: experience command — timeline with clickable detail expansion"
```

---

## Task 12: `projects` Command

**Files:**
- Modify: `js/commands/projects.js`

- [ ] **Step 1: Replace stub with full implementation**

```js
import { PROJECTS }   from '../data/projects.js';
import { escapeHtml } from '../utils/html.js';
import { scanIn }     from '../utils/scanIn.js';

export default {
  name:        'projects',
  description: 'List project modules. Use --detail <id> for full view',
  render(args, outputEl) {
    if (args[0] === '--detail' && args[1]) {
      renderDetail(args[1], outputEl);
    } else {
      renderList(outputEl);
    }
  },
};

function renderList(outputEl) {
  const cards = PROJECTS.map(projectCard).join('');
  const lines = [
    `<div class="section-header">▸ PROJECT MODULES — ${PROJECTS.length} ACTIVE</div>`,
    `<div class="project-grid">${cards}</div>`,
  ];
  scanIn(outputEl, lines, 60);

  // Bind card clicks + keyboard after render
  setTimeout(() => {
    outputEl.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => window.mkyRun(`projects --detail ${card.dataset.project}`));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') window.mkyRun(`projects --detail ${card.dataset.project}`);
      });
    });
  }, 200);
}

function projectCard(p) {
  const metrics = p.metrics.slice(0, 2)
    .map(m => `<span class="metric">${m.value} ${m.label}</span>`).join('');
  const tags = p.stack.slice(0, 4)
    .map(t => `<span class="tag">${t}</span>`).join('');
  return `<div class="project-card" data-project="${p.id}" role="button" tabindex="0">
    <div class="card-header">
      <span class="card-name">${p.name}</span>
      <span class="card-badge">${p.status}</span>
    </div>
    <div class="card-tagline">${p.tagline}</div>
    <div class="card-metrics">${metrics}</div>
    <div class="card-tags">${tags}</div>
  </div>`;
}

function renderDetail(id, outputEl) {
  const p = PROJECTS.find(proj => proj.id === id.toLowerCase());
  if (!p) {
    outputEl.innerHTML =
      `<div class="cmd-error">module not found: ${escapeHtml(id)}. Type 'projects' to list modules.</div>`;
    return;
  }

  const metrics    = p.metrics.map(m =>
    `<div class="detail-metric">
      <div class="detail-metric-value">${m.value}</div>
      <div class="detail-metric-label">${m.label}</div>
    </div>`).join('');

  const challenges = p.challenges.map(c => `<li>${c}</li>`).join('');
  const stack      = p.stack.map(t => `<span class="tag">${t}</span>`).join('');
  const links      = p.links.map(l =>
    `<a class="about-link" href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
  ).join('');

  const lines = [
    `<div class="project-detail">
      <div class="detail-header">
        <div>
          <div class="detail-name">${p.name}</div>
          <div class="detail-org">${p.org} · ${p.tagline}</div>
        </div>
        <span class="card-badge">${p.status}</span>
      </div>
      <hr class="detail-divider">

      <div class="detail-metrics">${metrics}</div>

      <div class="detail-section">
        <div class="detail-section-label">Problem</div>
        <div class="detail-section-body">${p.problem}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-label">Approach</div>
        <div class="detail-section-body">${p.approach}</div>
      </div>

      <div class="detail-section">
        <div class="detail-section-label">Key Challenges</div>
        <ul class="detail-challenges">${challenges}</ul>
      </div>

      <div class="detail-section">
        <div class="detail-section-label">Stack</div>
        <div class="detail-stack">${stack}</div>
      </div>

      ${links ? `<div class="detail-section"><div class="detail-section-label">Links</div><div class="about-links">${links}</div></div>` : ''}

      <div class="detail-back">← type <span>projects</span> to return to module list</div>
    </div>`,
  ];

  scanIn(outputEl, lines, 30);
}
```

- [ ] **Step 2: Type `projects` → 4 cards appear in a 2-col grid**

- [ ] **Step 3: Click any card → `projects --detail <id>` echoes in prompt → full detail renders with all sections**

- [ ] **Step 4: Type `projects --detail testgenie` directly → same detail view**

- [ ] **Step 5: Type `projects --detail unknown` → error message with hint**

- [ ] **Step 6: Commit**

```bash
git add js/commands/projects.js
git commit -m "feat: projects command — card grid with clickable detail view"
```

---

## Task 13: `skills`, `writings`, `contact` Commands

**Files:**
- Modify: `js/commands/skills.js`
- Modify: `js/commands/writings.js`
- Modify: `js/commands/contact.js`

- [ ] **Step 1: Write `js/commands/skills.js`**

```js
import { PROFILE } from '../data/profile.js';
import { scanIn }  from '../utils/scanIn.js';

const MAX_LEVEL = 5;

export default {
  name:        'skills',
  description: 'Display tech matrix',
  render(_args, outputEl) {
    const categories = Object.entries(PROFILE.skills).map(([cat, items]) => {
      const rows = items.map(({ name, level }) => {
        const bar = Array.from({ length: MAX_LEVEL }, (_, i) =>
          `<span class="skill-block ${i < level ? 'filled' : 'empty'}"></span>`
        ).join('');
        return `<div class="skill-row">
          <span class="skill-name">${name}</span>
          <span class="skill-bar">${bar}</span>
        </div>`;
      }).join('');

      return `<div class="skill-category">
        <div class="skill-category-label">${cat}</div>
        ${rows}
      </div>`;
    }).join('');

    const lines = [
      `<div class="section-header">▸ TECH MATRIX</div>`,
      `<div class="skills-grid">${categories}</div>`,
    ];
    scanIn(outputEl, lines, 50);
  },
};
```

- [ ] **Step 2: Write `js/commands/writings.js`**

```js
import { PROFILE } from '../data/profile.js';
import { scanIn }  from '../utils/scanIn.js';

export default {
  name:        'writings',
  description: 'List publications',
  render(_args, outputEl) {
    const rows = PROFILE.writings.map(w =>
      `<div class="writing-row">
        <span class="writing-perms">-rw-r--r--</span>
        <span class="writing-year">${w.year}</span>
        <span class="writing-title">${w.title}</span>
        <a class="writing-link" href="${w.href}" target="_blank" rel="noopener noreferrer">[→ read]</a>
      </div>`
    ).join('');

    const lines = [
      `<div class="section-header">▸ PUBLICATIONS</div>`,
      `<div class="writings-list">${rows}</div>`,
    ];
    scanIn(outputEl, lines, 50);
  },
};
```

- [ ] **Step 3: Write `js/commands/contact.js`**

```js
import { PROFILE } from '../data/profile.js';
import { scanIn }  from '../utils/scanIn.js';

export default {
  name:        'contact',
  description: 'Show contact information',
  render(_args, outputEl) {
    const rows = PROFILE.links.map(({ label, href, display }) =>
      `<div class="contact-row">
        <span class="contact-label">${label}</span>
        <span class="contact-value">${display}</span>
        <a class="contact-link" href="${href}" target="_blank" rel="noopener noreferrer">[→ open]</a>
      </div>`
    ).join('');

    const catEcho = `<div class="cmd-echo" style="margin-top:0;margin-bottom:8px;">` +
      `<span class="prompt-label">visitor@mky:~$</span>` +
      `<span class="cmd-text"> cat contact.txt</span></div>`;

    const lines = [
      catEcho,
      `<div class="contact-list">${rows}</div>`,
      `<div class="muted" style="margin-top:8px;font-size:var(--fs-xs)">location &nbsp; Bangalore, India</div>`,
    ];
    scanIn(outputEl, lines, 50);
  },
};
```

- [ ] **Step 4: Test each command in browser — `skills`, `writings`, `contact` should all render correctly**

- [ ] **Step 5: Commit**

```bash
git add js/commands/skills.js js/commands/writings.js js/commands/contact.js
git commit -m "feat: skills, writings, and contact commands"
```

---

## Task 14: Mobile CSS

**Files:**
- Modify: `css/mobile.css`

- [ ] **Step 1: Write `css/mobile.css`**

```css
/* ============================================================
   MOBILE COMMAND BUTTON GRID
   Visible only on ≤768px. Hidden on desktop.
   ============================================================ */
@media (max-width: 768px) {

  /* Show the command grid */
  .mobile-commands {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 8px 12px;
    border-top: 1px solid var(--cyan-border);
    background: var(--bg-nav);
    flex-shrink: 0;
  }

  .cmd-btn {
    background: rgba(0, 200, 255, 0.06);
    border: 1px solid var(--cyan-border);
    color: var(--cyan);
    font-family: var(--font);
    font-size: var(--fs-xs);
    letter-spacing: 1px;
    padding: 10px 6px;
    border-radius: 3px;
    cursor: pointer;
    min-height: 44px;
    transition: all var(--transition);
    text-align: center;
  }

  .cmd-btn:active {
    background: var(--cyan-ghost);
    border-color: var(--cyan);
  }

  /* Condensed nav — horizontal scroll, no text wrapping */
  .terminal-nav {
    gap: 0;
    padding: 0 12px;
  }

  .nav-brand   { margin-right: 16px; }
  .nav-link    { padding: 4px 7px; font-size: 9px; }

  /* Output area has less padding */
  .terminal-output { padding: 14px 16px; }

  /* Prompt row */
  .terminal-input-row { padding: 0 16px; }

  /* Project cards stack to 1 column */
  .project-grid { grid-template-columns: 1fr; }

  /* Skills grid stacks to 1 column */
  .skills-grid  { grid-template-columns: 1fr; }

  /* About links wrap more tightly */
  .about-links  { gap: 7px; }

  /* Reduce heading size on small screens */
  .welcome-name  { font-size: var(--fs-lg); letter-spacing: 2px; }
  .detail-name   { font-size: var(--fs-lg); }

  /* Detail metrics 3-col still works, just smaller */
  .detail-metric-value { font-size: var(--fs-md); }
}
```

- [ ] **Step 2: Open `index.html` in browser, resize to 375px width**
  - 6 command buttons should appear below the prompt
  - Project cards should stack to 1 column
  - Nav bar should scroll horizontally if needed

- [ ] **Step 3: Tap each command button → output should appear correctly**

- [ ] **Step 4: Verify desktop at 1440px — command grid should be invisible, typing works as before**

- [ ] **Step 5: Commit**

```bash
git add css/mobile.css
git commit -m "feat: mobile CSS — command grid, responsive layout, condensed nav"
```

---

## Task 15: Polish — Scan-in, Glow, and Final Touches

**Files:**
- Modify: `css/main.css` (add cursor glow, focus ring)
- Modify: `css/terminal.css` (add transition to boot screen)

- [ ] **Step 1: Add focus ring and boot fade-out to `css/terminal.css`**

```css
/* Add at end of terminal.css */

/* Smooth boot screen fade-out */
.boot-screen {
  transition: opacity 0.4s ease-out;
}
.boot-screen.hidden {
  display: none !important; /* override .hidden for screens that skip transition */
}

/* Keyboard focus ring — visible on keyboard nav, hidden on mouse */
:focus-visible {
  outline: 1px solid var(--cyan);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

- [ ] **Step 2: Add `scanReveal` to all command output divs in `css/main.css`**

```css
/* Add at end of main.css */
.cmd-output > div {
  animation: scanReveal 0.15s ease-out both;
}
```

- [ ] **Step 3: Test keyboard navigation — Tab through nav links, Enter on a link should run the command, focus ring should be visible**

- [ ] **Step 4: Commit**

```bash
git add css/main.css css/terminal.css
git commit -m "feat: polish — scan-reveal animation, focus rings, boot fade transition"
```

---

## Task 16: GitHub Pages Deployment

**Files:**
- No code changes — repo setup and push only

- [ ] **Step 1: Create the GitHub repo**

Go to `https://github.com/new`:
- Repository name: `manishkyadava.github.io`
- Visibility: **Public** (required for free GitHub Pages)
- Do NOT initialise with README

- [ ] **Step 2: Add remote and push**

```bash
git remote add origin https://github.com/manishkyadava/manishkyadava.github.io.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**

Go to `https://github.com/manishkyadava/manishkyadava.github.io/settings/pages`:
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Click **Save**

- [ ] **Step 4: Wait ~60 seconds, then open `https://manishkyadava.github.io`**

- [ ] **Step 5: Verify against the full checklist**
  - [ ] Boot sequence plays on first visit
  - [ ] Reload → boot does NOT replay
  - [ ] Type `help` → 8 commands listed
  - [ ] Type each command → output renders correctly
  - [ ] Type `projects` → 4 cards; click card → full detail with problem/approach/challenges/metrics
  - [ ] Type `experience` → 3 timeline entries; click entry → bullets expand
  - [ ] `clear` wipes output; `↑`/`↓` cycles history; `Tab` autocompletes
  - [ ] Nav link click = same output as typing the command
  - [ ] Resize to 375px → 6 command buttons appear; tap each → works
  - [ ] All external links open in new tab
  - [ ] No console errors

- [ ] **Step 6: Commit final verification note**

```bash
git commit --allow-empty -m "chore: deployed to manishkyadava.github.io"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| ENCOM aesthetic (colors, scanlines, corner brackets, glow) | Task 2, 3, 15 |
| Boot sequence, sessionStorage skip, mobile TAP TO CONTINUE | Task 6 |
| Typed commands (primary), nav links (fallback), same code path | Task 7, 8 |
| Command registry extensibility contract `{ name, description, render }` | Task 8 |
| `about` — bio, links | Task 10 |
| `experience` — timeline, clickable detail expansion | Task 11 |
| `projects` — card grid, clickable `--detail` view with problem/approach/challenges | Task 12 |
| `skills` — category matrix with ASCII block bars | Task 13 |
| `writings` — file listing format | Task 13 |
| `contact` — cat contact.txt format | Task 13 |
| `help` — auto-generated from registry | Task 8 |
| `clear` built-in | Task 7, 8 |
| Mobile command button grid (≤768px), desktop hidden | Task 14 |
| Responsive: project grid 2→1 col, skills grid 2→1 col | Task 14 |
| Up/down history, tab autocomplete | Task 7 |
| All interactive elements keyboard-accessible | Task 15 |
| `manishkyadava.github.io` GitHub Pages deploy | Task 16 |
| `.gitignore` with `.superpowers/` | Task 1 |
| XSS prevention via `escapeHtml` | Task 4, 7 |

All spec requirements covered. No placeholders. Method names consistent across tasks (`render`, `scanIn`, `runBoot`, `initTerminal`, `runCommand`, `window.mkyRun`). Data property names consistent (`id`, `name`, `status`, `metrics`, `stack`, `problem`, `approach`, `challenges`, `bullets`, `brightness`).

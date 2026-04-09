# manishkyadava.github.io

Personal portfolio website — ENCOM terminal aesthetic, typed command navigation, deployed on GitHub Pages.

**Live:** [manishkyadava.github.io](https://manishkyadava.github.io)

---

## What It Is

A terminal-themed portfolio inspired by the [ENCOM boardroom scene](https://www.robscanlon.com/encom-boardroom/). No scrolling, no hamburger menus — you navigate by typing commands (`about`, `projects`, `experience`, etc.) or tapping buttons on mobile.

Built with zero dependencies: plain HTML, CSS, and Vanilla JS ES Modules. No framework, no bundler, no build step. Push to `main` → live in 30 seconds.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (single `index.html`) |
| Styling | CSS3 with custom properties |
| Logic | Vanilla JS ES Modules |
| Font | JetBrains Mono (Google Fonts) |
| Hosting | GitHub Pages (free, public repo) |

---

## How It Works

- **Boot sequence** — fake system-init animation on first visit, skipped on reload via `sessionStorage`
- **Command registry** — each section is a JS module `{ name, description, render(args, outputEl) }`. Adding a new section = one file + one import, nothing else
- **Same code path** — typing a command, clicking a nav link, or tapping a mobile button all call the same `runCommand()` function
- **Data layer** — all content lives in `js/data/*.js`, completely separate from render logic. Update your job title without touching any UI code
- **`scanIn()` animation** — staggered `setTimeout` loop that prints output line-by-line like a real terminal

---

## Project Structure

```
├── index.html
├── css/
│   ├── main.css        # Variables, reset, scanlines overlay
│   ├── terminal.css    # Nav, prompt, output area
│   ├── sections.css    # Per-section card/content styles
│   └── mobile.css      # ≤768px responsive overrides
├── js/
│   ├── main.js         # Entry: boot → terminal handoff
│   ├── boot.js         # Boot sequence animation
│   ├── terminal.js     # Input, history, tab-complete, dispatch
│   ├── commands/       # One file per command
│   ├── data/           # Content: profile, projects, experience
│   └── utils/          # escapeHtml, scanIn
└── tests/
    └── test.html       # Browser-based test runner
```

---

## How I Built This — Vibe Coding with Claude Code

This entire portfolio was **vibe coded** — I described what I wanted, and [Claude Code](https://claude.ai/code) handled the implementation. The whole first version went from idea to live site in **~90 minutes** in a single session.

### The Workflow

I used Claude Code with the **Superpowers plugin** — a set of structured skills that turn Claude into a disciplined engineering collaborator rather than just a code generator.

**Phase 1 — Brainstorming** (`superpowers:brainstorming`)
I described the ENCOM boardroom inspiration and my requirements. Claude asked clarifying questions one at a time, proposed 2-3 design approaches with trade-offs, then presented a full visual design in the browser — mockups of the boot screen, terminal layout, and each section — before writing a single line of code. I approved the design, and it was saved as a spec document.

**Phase 2 — Planning** (`superpowers:writing-plans`)
Claude turned the approved spec into a 16-task implementation plan with exact file paths, complete code for every step, and expected test output. No placeholders, no "add error handling here" — actual working code per step.

**Phase 3 — Execution** (`superpowers:subagent-driven-development`)
Each task was dispatched to a fresh subagent (isolated context, no pollution from previous tasks). After each task: spec compliance review → code quality review → fix if needed → mark done. Two tasks ran in parallel wherever possible (e.g. boot sequence + terminal core simultaneously).

### Skills Used

| Skill | Purpose |
|---|---|
| `superpowers:brainstorming` | Design exploration, visual mockups, spec writing |
| `superpowers:writing-plans` | 16-task implementation plan with full code |
| `superpowers:using-git-worktrees` | Isolated `feat/portfolio-website` branch + worktree |
| `superpowers:subagent-driven-development` | Fresh subagent per task, spec + quality review gates |
| `superpowers:finishing-a-development-branch` | Merge, cleanup, GitHub push |
| `frontend-design` | ENCOM aesthetic guidance, UI/UX quality |
| `ui-ux-pro-max` | Accessibility checks (touch targets, focus rings, contrast) |

### Stats

| Metric | Value |
|---|---|
| Time to first live version | ~90 minutes |
| Date | April 9, 2026 |
| Git commits | 20 |
| Lines of code | ~1,550 |
| Human keystrokes for implementation | Basically zero |
| Times I said "looks good" | A lot |

### What "Vibe Coding" Actually Means Here

It's not just asking Claude to write code and hoping for the best. The quality comes from the workflow:

1. **Design before code** — the brainstorming skill hard-gates implementation until a design is approved. No surprise pivots mid-build.
2. **Spec compliance reviews** — a separate reviewer subagent checks every task against the spec. Prevents drift.
3. **Code quality reviews** — another reviewer checks for XSS, accessibility, edge cases. Caught real issues (missing `focus-visible` states, empty `input.value` tab completion bug, unguarded `JSON.parse`).
4. **Data separated from UI** — updating content never touches render logic. Future me will thank present me.

The human role: describe the vision clearly, approve design decisions, and occasionally run `git push`. Claude handles the rest.

---

## Running Locally

No build step needed. Open `index.html` directly in a browser — or use any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open `tests/test.html` to run the utility function tests.

---

## Adding a New Section

1. Create `js/commands/mysection.js`:
```js
export default {
  name:        'mysection',
  description: 'One-line description for help output',
  render(_args, outputEl) {
    outputEl.innerHTML = '<div>your content here</div>';
  },
};
```

2. Add to `js/commands/index.js`:
```js
import mysection from './mysection.js';
// add mysection to the registration array
```

3. Add a nav link in `index.html` and a mobile button. Done.

---

*Built with [Claude Code](https://claude.ai/code) + Superpowers*

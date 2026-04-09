# Portfolio Website Design Spec
**Date:** 2026-04-09
**Author:** Manish K Yadava
**Status:** Approved

---

## Context

Manish needs a personal portfolio website hosted as a static site on GitHub Pages (`manishkyadava.github.io`). The goal is a memorable, distinctive presence for recruiters, collaborators, and the technical community — one that reflects his identity as an AI-augmented engineer who lives in the command line.

The aesthetic is inspired by [robscanlon.com/encom-boardroom](https://www.robscanlon.com/encom-boardroom/): cinematic, sci-fi terminal, deep black with electric cyan. Navigation is command-driven (type `projects` to see projects), not scroll-based.

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Aesthetic | ENCOM/TRON Boardroom | Cinematic, sci-fi corporate. Deep black, electric cyan grid. |
| Navigation | Typed commands (primary) + nav links (fallback) | Max immersion; nav links ensure recruiters can still browse |
| Mobile | Tappable command buttons below output | Desktop purity preserved; mobile gets touch-friendly UX |
| Tech stack | Plain HTML + CSS + Vanilla JS | Zero build step; deploys directly to GitHub Pages |
| Hosting | `manishkyadava.github.io` | GitHub Pages, repo name: `manishkyadava.github.io` |
| Extensibility | Each section = one self-contained JS module | Add a section = add one file + register one command |

---

## Visual Identity

### Colors
| Role | Value |
|---|---|
| Background | `#000510` (deep navy black) |
| Primary accent | `#00C8FF` / `#0ff` (electric cyan) |
| Success / metrics | `#22FF88` (phosphor green) |
| Text primary | `rgba(255,255,255,0.85)` |
| Text muted | `rgba(0,200,255,0.5)` |
| Card border | `rgba(0,200,255,0.25)` |
| Card fill | `rgba(0,200,255,0.04)` |

### Typography
- **Font:** JetBrains Mono (Google Fonts) — all text, headings and body
- **Import:** `https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap`

### Effects
- **Scanlines:** `repeating-linear-gradient` overlay, 4px pitch, 1.5% cyan opacity — full page background
- **Corner brackets:** CSS `::before`/`::after` on key containers — top-left and bottom-right only
- **Text glow:** `text-shadow: 0 0 12px rgba(0,200,255,0.7)` on headings
- **Card glow on hover:** `box-shadow: 0 0 16px rgba(0,200,255,0.15)`, `border-color` brightens
- **Scan-in animation:** lines of output appear sequentially via `setTimeout` with staggered delay
- **Cursor blink:** `█` character, CSS `animation: blink 1s step-end infinite`
- **Boot progress:** each log line types in with 200ms delay

---

## Architecture

### File Structure
```
manishkyadava.github.io/
├── index.html              # Entry point — full page app
├── css/
│   ├── main.css            # Variables, base, scanlines, layout
│   ├── terminal.css        # Prompt, output, history styles
│   ├── sections.css        # Per-section card/content styles
│   └── mobile.css          # Responsive overrides (≤768px)
├── js/
│   ├── terminal.js         # Core: input handling, history, command dispatch
│   ├── boot.js             # Boot sequence animation, sessionStorage skip
│   ├── commands/
│   │   ├── index.js        # Command registry — import all commands here
│   │   ├── about.js
│   │   ├── experience.js
│   │   ├── projects.js     # Lists cards; handles --detail <name>
│   │   ├── skills.js
│   │   ├── writings.js
│   │   ├── contact.js
│   │   ├── help.js         # Auto-generated from registry
│   │   └── clear.js
│   └── data/
│       ├── projects.js     # Project data objects
│       ├── experience.js   # Work history data
│       └── profile.js      # Name, bio, contact, skills
└── assets/
    └── favicon.ico
```

### Extensibility Contract
Every command module exports a single object:
```js
export default {
  name: 'commandname',          // the typed command
  description: 'One-liner',     // shown in help output
  render(args, outputEl) {      // writes HTML into outputEl
    // ...
  }
}
```
Registering it in `commands/index.js` is the only other step. No routing changes, no HTML changes.

---

## Sections & Content

### Boot Sequence (`boot.js`)
- Full-screen on first visit (`sessionStorage` key prevents repeat)
- Sequential log lines (200ms stagger):
  - `✓ Kernel loaded ..................... 12ms`
  - `✓ Identity module verified .......... MANISH K YADAVA`
  - `✓ Experience log indexed ............ 6 YRS · 3 ORGS`
  - `✓ Project modules compiled .......... 4 ACTIVE`
  - `✓ AI skills matrix loaded ........... CLAUDE · AWS · JAVA`
  - `✓ Comms link established ............ SECURE`
  - `PORTFOLIO READY █`
- Desktop: "PRESS ENTER OR WAIT..." → auto-advances after 1.5s or on any key
- Mobile: "TAP TO CONTINUE" → advances on tap
- Any key/tap at any point skips the sequence

### Main Terminal Layout
```
┌──────────────────────────────────────────────────────────────────┐
│ MKY://  about  experience  projects  skills  writings  contact   │  ← nav bar (fallback links)
├──────────────────────────────────────────────────────────────────┤
│                                                     │
│  [scrollable output area]                           │
│  — command echoes + section outputs stack here      │
│  — keeps full history like a real shell             │
│                                                     │
├─────────────────────────────────────────────────────┤
│ visitor@mky:~$ █                                    │  ← persistent prompt
└─────────────────────────────────────────────────────┘
```
- Nav bar link click → echoes command in prompt → runs it (same code path as typing)
- Active section → underline on nav link
- `↑`/`↓` arrows cycle command history
- `clear` → wipes output, keeps prompt
- `help` → lists all registered commands with descriptions

### `about`
- ENCOM-style header: `▸ IDENTITY MODULE`
- Name + title + location
- 2–3 sentence bio (AI-augmented engineering philosophy)
- Links: LinkedIn, Medium, GitHub — rendered as `[→ linkedin]` clickable terminal tokens

### `experience`
- Header: `▸ MISSION LOG — 3 ASSIGNMENTS`
- Vertical timeline, left border brightness indicates recency:
  - **Jumio** (full brightness `#0ff`) — SDET-3 · Team Lead · Jun 2024–Present
    - Key achievements with metrics (bullet `↳`)
  - **Acko** (mid brightness) — SDET-1→2 · Aug 2021–May 2024
  - **Capgemini** (low brightness) — Analyst→Assoc. Consultant · Nov 2018–Jul 2021
- Each role is clickable → `experience --detail jumio` expands full bullet list

### `projects`
- Header: `▸ PROJECT MODULES — 4 ACTIVE`
- Grid of project cards (2-col desktop, 1-col mobile):
  - Name (glowing), status badge (ACTIVE/SHIPPED), one-liner, key metric pair, tech tags
- **Clicking/tapping a card** → echoes `projects --detail <name>` → replaces list with full detail
- Full detail view includes:
  - **Name + status + org badge**
  - **Problem statement** — what was broken/missing before this was built
  - **Approach** — architecture decisions, key design choices
  - **Key challenges** — what was hard, how it was solved
  - **Impact metrics** — quantified outcomes (grid of 3)
  - **Tech stack tags**
  - **Team context** — size, role
  - **Links** — GitHub (if public), Medium write-up (if exists)
  - `← type projects to return`

**Projects covered:**
1. TestGenie — AI test management SaaS (Java 21/Quarkus/AWS/React 18)
2. Bulldozer — LangChain doc pipeline (Python/LangChain/73+ microservices)
3. Event-Driven Test Framework — SNS/SQS automation (Java/AWS/15+ microservices)
4. Claude Code Toolkit — Team AI tooling standardisation (Bash/MCP/Skills)

### `skills`
- Header: `▸ TECH MATRIX`
- `ls -la skills/` style output with categories:
  - **Languages:** Java 21, Python, TypeScript, Bash, SQL
  - **Testing:** TestNG, Playwright, RestAssured, JUnit, Selenium
  - **Cloud & Infra:** AWS Lambda, DynamoDB, SNS/SQS, Jenkins, GitHub
  - **AI & LLMs:** Claude/Anthropic, LangChain, AWS Bedrock, MCP Servers
  - **Frontend:** React 18, TypeScript, Material UI, Vite
- Proficiency shown as ASCII block bar: `████░░` (5-block scale)

### `writings`
- Header: `▸ PUBLICATIONS`
- Terminal file listing format:
  ```
  -rw-r--r--  2024  TestRail Integration with Automation Framework  [→ medium]
  ```
- Links open in new tab

### `contact`
- `$ cat contact.txt` echo then output:
  ```
  email      manishkyadava19@gmail.com         [→ mailto]
  linkedin   linkedin.com/in/manish-k-yadava   [→ open]
  github     github.com/manishkyadava          [→ open]
  location   Bangalore, India
  ```

---

## Mobile Behaviour (≤768px)

- Boot sequence: "TAP TO CONTINUE" replaces "PRESS ENTER"
- Command button grid appears **below** the prompt:
  - 3-column grid of tappable buttons: `about`, `experience`, `projects`, `skills`, `writings`, `contact`
  - Tapping a button echoes the command in the prompt and executes it (same code path)
  - Desktop: button grid hidden via `display: none`
- Project cards stack to 1-column
- Nav bar condenses to horizontal scrollable strip (`overflow-x: auto`, no hamburger) — 6 items fit with smaller font and tighter spacing
- Font sizes scale down proportionally
- Touch targets: minimum 44×44px on all interactive elements

---

## GitHub Pages Deployment

- Repo name: `manishkyadava.github.io`
- Branch: `main`
- GitHub Pages source: root `/` of `main`
- No build step — push HTML/CSS/JS directly
- URL: `https://manishkyadava.github.io`
- `.gitignore`: include `.superpowers/`

---

## Verification

1. Open `index.html` directly in browser (no server needed for basic test)
2. Boot sequence plays, `sessionStorage` skip works on reload
3. Type `help` → all 7 commands listed
4. Type each command → output scans in correctly
5. Type `projects` → card grid appears; click a card → detail view renders
6. Type `experience` → timeline renders; click a role → detail expands
7. `clear` wipes output; `↑`/`↓` cycles history
8. Resize to 375px → button grid appears, nav condenses, all touch targets ≥44px
9. Nav link click = same output as typing the command
10. Push to `manishkyadava.github.io` repo → verify live at `https://manishkyadava.github.io`

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
    if (!e.target.closest('a, button, [role="button"], .project-card, .exp-entry')) {
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

  function pushHistory(cmd) {
    history = [cmd, ...history.filter(h => h !== cmd)].slice(0, MAX_HISTORY);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function setActiveNav(cmd) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.command === cmd);
    });
  }

  /**
   * Parse raw input, echo it, dispatch to registry, scroll to bottom.
   * Exposed on window so command modules can trigger sub-commands
   * (e.g., project card click → projects --detail testgenie).
   */
  function runCommand(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    // Echo the command
    const echoEl = document.createElement('div');
    echoEl.className = 'cmd-echo';
    echoEl.innerHTML =
      `<span class="prompt-label">visitor@mky:~$</span>` +
      `<span class="cmd-text"> ${escapeHtml(raw)}</span>`;
    output.appendChild(echoEl);

    // Built-in: clear (resets entire output div — must come before registry dispatch)
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

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

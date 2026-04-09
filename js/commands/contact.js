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

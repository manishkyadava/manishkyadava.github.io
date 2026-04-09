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

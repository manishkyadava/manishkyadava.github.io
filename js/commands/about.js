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

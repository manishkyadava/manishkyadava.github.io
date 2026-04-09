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

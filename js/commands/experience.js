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

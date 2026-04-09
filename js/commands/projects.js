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

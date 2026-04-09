/**
 * Escape user-facing strings before inserting into innerHTML.
 * All data values (commands typed, project names, etc.) must go through this.
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build a tag string. Convenience for template literals.
 * e.g. tag('span', 'boot-check', '✓')
 */
export function tag(element, className, content) {
  return `<${element} class="${className}">${content}</${element}>`;
}

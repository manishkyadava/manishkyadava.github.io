/**
 * Append HTML strings to containerEl one by one with a staggered delay.
 * Each string is wrapped in a <div> and added to the DOM sequentially.
 *
 * @param {HTMLElement} containerEl  - Element to append lines into
 * @param {string[]}    lines        - Array of HTML strings (one per line/block)
 * @param {number}      delayMs      - Gap between lines in milliseconds (default 40)
 * @returns {Promise<void>}          - Resolves after the last line is appended
 */
export function scanIn(containerEl, lines, delayMs = 40) {
  return new Promise((resolve) => {
    lines.forEach((html, i) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.innerHTML = html;
        containerEl.appendChild(div);
        // Keep output scrolled to bottom
        const output = document.getElementById('output');
        if (output) output.scrollTop = output.scrollHeight;
        if (i === lines.length - 1) resolve();
      }, i * delayMs);
    });
    if (lines.length === 0) resolve();
  });
}

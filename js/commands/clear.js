// clear is handled as a built-in in terminal.js (it resets the entire output div).
// This entry exists solely so `help` can list it.
export default {
  name:        'clear',
  description: 'Clear the terminal output',
  render() {}, // no-op: terminal.js intercepts this before reaching here
};

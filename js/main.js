import { runBoot }      from './boot.js';
import { initTerminal } from './terminal.js';

const bootScreen = document.getElementById('boot-screen');
const terminal   = document.getElementById('terminal');

runBoot(bootScreen, () => {
  bootScreen.classList.add('hidden');
  terminal.classList.remove('hidden');
  initTerminal();
});

import { app } from './firebase-config.js';

const statusEl = document.querySelector('#status');
document.querySelector('#btn')?.addEventListener('click', () => {
  statusEl.textContent = 'Preview ON dentro do Codespaces ✅';
});

statusEl.textContent = `Firebase conectado: ${app.name}`;

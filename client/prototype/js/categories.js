import { getSettings, saveSettings } from './settings.js';

const s = getSettings();
const timeInput = document.getElementById('time');
const timeOut = document.getElementById('timeOut');
const roundsOut = document.getElementById('roundsOut');

document.querySelector(`input[name="category"][value="${s.category}"]`).checked = true;
timeInput.value = s.time;
timeOut.textContent = s.time + 's';
roundsOut.textContent = s.rounds;

timeInput.oninput = () => {
  s.time = Number(timeInput.value);
  timeOut.textContent = s.time + 's';
};

document.getElementById('minus').onclick = () => {
  s.rounds = Math.max(1, s.rounds - 1);
  roundsOut.textContent = s.rounds;
};
document.getElementById('plus').onclick = () => {
  s.rounds = Math.min(10, s.rounds + 1);
  roundsOut.textContent = s.rounds;
};

document.getElementById('startBtn').onclick = () => {
  s.category = document.querySelector('input[name="category"]:checked').value;
  saveSettings(s);
  location.href = 'game.html';
};
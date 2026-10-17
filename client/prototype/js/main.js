import { getSettings } from './settings.js';
import { pickWords } from './words.js';

const settings = getSettings();
const words = pickWords(settings.category, settings.rounds);
const drawings = [];   // one PNG per round, for the AI later
let round = 0;
let timeLeft = settings.time;
let timerId;

function startRound() {
  drawing.clear();
  timeLeft = settings.time;
  document.getElementById('roundLabel').textContent = `Round ${round + 1} of ${settings.rounds}`;
  document.getElementById('wordLabel').textContent = `Draw: ${words[round]}`;
  document.getElementById('timerLabel').textContent = timeLeft + 's';

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById('timerLabel').textContent = timeLeft + 's';
    if (timeLeft <= 0) endRound();
  }, 1000);
}

function endRound() {
  clearInterval(timerId);
  drawings.push({ word: words[round], image: drawing.exportPNG(true) });
  round++;
  if (round < settings.rounds) {
    startRound();
  } else {
    sessionStorage.setItem('drawResults', JSON.stringify(drawings));
    location.href = 'results.html';
  }
}

startRound();
const KEY = 'drawSettings';
const defaults = { category: 'animals', time: 60, rounds: 3 };

export function getSettings() {
  try {
    return { ...defaults, ...JSON.parse(sessionStorage.getItem(KEY)) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(s) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}
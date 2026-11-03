let context;
let enabled = true;

export function setAudioEnabled(value) {
  enabled = value;
}

export function playSound(type = 'click') {
  if (!enabled || typeof window === 'undefined') return;
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') context.resume();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.connect(context.destination);
    const osc = context.createOscillator();
    osc.connect(gain);
    const settings = {
      click: [180, 0.035, 'square', 0.025],
      paper: [95, 0.07, 'sawtooth', 0.018],
      stamp: [72, 0.16, 'square', 0.09],
      approve: [330, 0.18, 'sine', 0.045],
      error: [105, 0.34, 'sawtooth', 0.055],
      coin: [620, 0.14, 'square', 0.035],
      open: [240, 0.09, 'triangle', 0.03],
      step: [82, 0.12, 'square', 0.025],
      voice: [135, 0.06, 'triangle', 0.018],
    }[type] || [180, 0.05, 'square', 0.025];
    const [frequency, duration, wave, volume] = settings;
    osc.type = wave;
    osc.frequency.setValueAtTime(frequency, now);
    if (type === 'stamp') osc.frequency.exponentialRampToValueAtTime(42, now + duration);
    if (type === 'approve') osc.frequency.exponentialRampToValueAtTime(495, now + duration);
    if (type === 'coin') osc.frequency.exponentialRampToValueAtTime(930, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Audio is optional; browser privacy settings may disable it.
  }
}

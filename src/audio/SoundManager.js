/**
 * SoundManager — Web Audio API procedural sounds
 * No audio files needed; all sounds are synthesized.
 */

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(fn) {
  if (muted) return;
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
    fn(ac);
  } catch (e) {
    // silently fail if audio not available
  }
}

/** Short click "tap" sound */
export function playClick() {
  play(ac => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.12);
  });
}

/** Purchase building — slightly lower, satisfying thud */
export function playBuy() {
  play(ac => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.2);
  });
}

/** Upgrade purchased — bright chime */
export function playUpgrade() {
  play(ac => {
    [523, 659, 784].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      const t = ac.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  });
}

/** Milestone / achievement toast — celebratory fanfare */
export function playMilestone() {
  play(ac => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'square';
      const t = ac.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  });
}

/** Golden cookie click — sparkle arpeggio */
export function playGoldenCookie() {
  play(ac => {
    [880, 1100, 1320, 1760].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      const t = ac.currentTime + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  });
}

/** Prestige — dramatic descending sweep */
export function playPrestige() {
  play(ac => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 1.2);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.setValueAtTime(0.15, ac.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.4);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 1.4);
  });
}

export function isMuted() { return muted; }
export function setMuted(val) { muted = val; }
export function toggleMute() { muted = !muted; return muted; }

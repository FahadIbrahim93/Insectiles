import { Log } from './utils';

let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    Log.info('initAudio', 'AudioContext created', { state: audioCtx.state });
  } catch (e) {
    Log.warn('initAudio', 'Web Audio API unavailable — SFX disabled', e);
  }
}

export function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.15, attack = 0.005, decay = 0.1, freqEnd: number | null = null) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + decay);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + decay + 0.05);
  } catch (e) {
    Log.warn('playTone', 'Audio error', e);
  }
}

export function sfxAttack() { playTone(320, 'sawtooth', 0.04, 0.08, 0.003, 0.06, 180); }
export function sfxKill() {
  playTone(180, 'square', 0.06, 0.12, 0.005, 0.12, 60);
  playTone(260, 'sine', 0.08, 0.06, 0.005, 0.10, 440);
}
export function sfxAbility() { playTone(440, 'sine', 0.15, 0.18, 0.01, 0.2, 880); }
export function sfxUpgrade() {
  [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.1, 0.12, 0.005, 0.12), i * 60));
}
export function sfxSynergy() {
  [330, 415, 523, 659, 830].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.12, 0.15, 0.01, 0.15), i * 80));
}
export function sfxHit() { playTone(100, 'sawtooth', 0.04, 0.20, 0.002, 0.08, 50); }
export function sfxGemPickup() { playTone(660, 'sine', 0.05, 0.08, 0.003, 0.08, 880); }
export function sfxLevelUp() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.12, 0.14, 0.005, 0.18), i * 90));
}

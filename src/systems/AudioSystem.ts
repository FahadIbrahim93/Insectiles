// ═══════════════════════════════════════════════════════════════════
// AUDIO SYSTEM — Procedural SFX + Dynamic BGM
// ═══════════════════════════════════════════════════════════════════

type SfxType = 'hit'|'crit'|'shoot'|'abil'|'lvl'|'death'|'boss'|'chest'|'combo'|'syn';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgmRunning = false;
  private bgmOsc: OscillatorNode | null = null;
  private bgmOsc2: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmLfoGain: GainNode | null = null;
  private enabled = true;

  init(): void {
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.25;
      this.master.connect(this.ctx.destination);
    } catch {
      this.enabled = false;
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  startBGM(): void {
    if (!this.enabled || !this.ctx || this.bgmRunning) return;
    this.bgmRunning = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.06;
    this.bgmGain.connect(this.master!);

    this.bgmOsc = this.ctx.createOscillator();
    this.bgmOsc.type = 'sawtooth';
    this.bgmOsc.frequency.value = 42;
    this.bgmOsc.connect(this.bgmGain);
    this.bgmOsc.start();

    this.bgmOsc2 = this.ctx.createOscillator();
    this.bgmOsc2.type = 'sine';
    this.bgmOsc2.frequency.value = 84;
    this.bgmLfoGain = this.ctx.createGain();
    this.bgmLfoGain.gain.value = 0.03;
    this.bgmOsc2.connect(this.bgmLfoGain);
    this.bgmLfoGain.connect(this.master!);
    this.bgmOsc2.start();
  }

  stopBGM(): void {
    if (!this.bgmRunning) return;
    this.bgmRunning = false;
    try { this.bgmOsc?.stop(); this.bgmOsc2?.stop(); } catch { /* ignore */ }
    this.bgmGain?.disconnect();
    this.bgmLfoGain?.disconnect();
    this.bgmOsc = this.bgmOsc2 = this.bgmGain = this.bgmLfoGain = null;
  }

  setBGMIntensity(t: number): void {
    if (!this.bgmRunning || !this.bgmOsc || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.bgmOsc.frequency.setTargetAtTime(42 + t * 28, now, 0.8);
    this.bgmGain!.gain.setTargetAtTime(0.05 + t * 0.12, now, 0.8);
  }

  play(type: SfxType): void {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g);
    g.connect(this.master!);

    switch (type) {
      case 'hit':   osc.type='square';   osc.frequency.setValueAtTime(200,now); osc.frequency.exponentialRampToValueAtTime(75,now+.08);   g.gain.setValueAtTime(.16,now); g.gain.exponentialRampToValueAtTime(.001,now+.09);  osc.start(now);osc.stop(now+.09);  break;
      case 'crit':  osc.type='sawtooth'; osc.frequency.setValueAtTime(480,now); osc.frequency.exponentialRampToValueAtTime(960,now+.06);  g.gain.setValueAtTime(.20,now); g.gain.exponentialRampToValueAtTime(.001,now+.15);  osc.start(now);osc.stop(now+.15);  break;
      case 'shoot': osc.type='sine';     osc.frequency.setValueAtTime(660,now); osc.frequency.exponentialRampToValueAtTime(220,now+.06);  g.gain.setValueAtTime(.055,now);g.gain.exponentialRampToValueAtTime(.001,now+.07);  osc.start(now);osc.stop(now+.07);  break;
      case 'abil':  osc.type='sawtooth'; osc.frequency.setValueAtTime(80,now);  osc.frequency.exponentialRampToValueAtTime(290,now+.18);  g.gain.setValueAtTime(.26,now); g.gain.exponentialRampToValueAtTime(.001,now+.28);  osc.start(now);osc.stop(now+.28);  break;
      case 'lvl':   osc.type='sine';     osc.frequency.setValueAtTime(330,now); osc.frequency.setValueAtTime(440,now+.1); osc.frequency.setValueAtTime(660,now+.2); g.gain.setValueAtTime(.20,now); g.gain.exponentialRampToValueAtTime(.001,now+.45); osc.start(now);osc.stop(now+.45); break;
      case 'death': osc.type='sawtooth'; osc.frequency.setValueAtTime(280,now); osc.frequency.exponentialRampToValueAtTime(40,now+.9);   g.gain.setValueAtTime(.32,now); g.gain.exponentialRampToValueAtTime(.001,now+.9);   osc.start(now);osc.stop(now+.9);   break;
      case 'boss':  osc.type='sawtooth'; osc.frequency.setValueAtTime(55,now);  osc.frequency.setValueAtTime(50,now+.5);                  g.gain.setValueAtTime(.35,now); g.gain.exponentialRampToValueAtTime(.001,now+1.2);  osc.start(now);osc.stop(now+1.2);  break;
      case 'chest': osc.type='sine';     osc.frequency.setValueAtTime(440,now); osc.frequency.setValueAtTime(554,now+.08); osc.frequency.setValueAtTime(659,now+.16); g.gain.setValueAtTime(.18,now); g.gain.exponentialRampToValueAtTime(.001,now+.5); osc.start(now);osc.stop(now+.5); break;
      case 'combo': osc.type='sine';     osc.frequency.setValueAtTime(880,now); osc.frequency.exponentialRampToValueAtTime(1320,now+.04); g.gain.setValueAtTime(.12,now); g.gain.exponentialRampToValueAtTime(.001,now+.08);  osc.start(now);osc.stop(now+.08);  break;
      case 'syn':
        for (let i = 0; i < 3; i++) {
          const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
          o2.connect(g2); g2.connect(this.master!);
          o2.type = 'sine'; o2.frequency.value = [330,440,660][i]!;
          g2.gain.setValueAtTime(0, now+i*.08);
          g2.gain.linearRampToValueAtTime(.16, now+i*.08+.05);
          g2.gain.exponentialRampToValueAtTime(.001, now+i*.08+.38);
          o2.start(now+i*.08); o2.stop(now+i*.08+.38);
        }
        break;
    }
  }
}

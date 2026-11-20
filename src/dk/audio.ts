import { WeaponId } from './types';

class DarkKingdomAudio {
  private ctx: AudioContext | null = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSettings(music: boolean, sfx: boolean) {
    this.musicEnabled = music;
    this.sfxEnabled = sfx;
    if (!music) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public unlock() {
    const ctx = this.ensureContext();
    if (ctx && this.musicEnabled && !this.musicTimer) {
      this.startMusic();
    }
  }

  public startMusic() {
    if (!this.musicEnabled || typeof window === 'undefined' || this.musicTimer) return;
    const scale = [146.83, 174.61, 196.0, 220.0, 261.63, 220.0, 174.61, 164.81];
    this.musicTimer = setInterval(() => {
      if (!this.musicEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx || ctx.state !== 'running') return;
      const freq = scale[this.musicStep % scale.length];
      const isBass = this.musicStep % 4 === 0;
      this.musicStep++;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isBass ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isBass ? freq * 0.5 : freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(isBass ? 0.032 : 0.018, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.68);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.72);
      } catch {
        // Ignore audio errors
      }
    }, 760);
  }

  public stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    volume = 0.08
  ) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);
      }
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore
    }
  }

  public playWeaponShot(weaponId: WeaponId) {
    switch (weaponId) {
      case 'shadow_archer':
        this.playTone(680, 290, 0.07, 'triangle', 0.045);
        break;
      case 'iron_cannon':
        this.playTone(130, 48, 0.19, 'sawtooth', 0.085);
        break;
      case 'ice_wizard':
        this.playTone(920, 1280, 0.11, 'sine', 0.05);
        break;
      case 'thunder_tower':
        this.playTone(1150, 240, 0.12, 'square', 0.055);
        break;
      case 'poison_tower':
        this.playTone(420, 610, 0.1, 'sine', 0.045);
        break;
      case 'fire_dragon':
        this.playTone(260, 110, 0.16, 'sawtooth', 0.065);
        break;
      case 'crystal_laser':
        this.playTone(1320, 880, 0.09, 'sine', 0.05);
        break;
      case 'ancient_guardian':
        this.playTone(170, 58, 0.24, 'triangle', 0.09);
        break;
      case 'sky_hunter':
        this.playTone(860, 420, 0.055, 'square', 0.042);
        break;
      case 'missile_platform':
        this.playTone(300, 140, 0.14, 'sawtooth', 0.06);
        break;
      case 'storm_cannon':
        this.playTone(540, 190, 0.15, 'square', 0.062);
        break;
      case 'drone_station':
        this.playTone(1240, 960, 0.06, 'sine', 0.038);
        break;
      case 'plasma_air_defense':
        this.playTone(1040, 520, 0.08, 'sawtooth', 0.05);
        break;
      case 'titan_plasma_cannon':
        this.playTone(195, 52, 0.24, 'sawtooth', 0.095);
        setTimeout(() => this.playTone(620, 220, 0.14, 'sine', 0.05), 35);
        break;
    }
  }

  public playBuild() {
    this.playTone(320, 480, 0.12, 'triangle', 0.08);
    setTimeout(() => this.playTone(480, 640, 0.12, 'triangle', 0.07), 65);
  }

  public playUpgrade() {
    this.playTone(440, 660, 0.1, 'sine', 0.08);
    setTimeout(() => this.playTone(660, 880, 0.14, 'sine', 0.08), 80);
  }

  public playSell() {
    this.playTone(580, 390, 0.14, 'triangle', 0.07);
  }

  public playEnemyDefeat(isBoss = false) {
    if (isBoss) {
      this.playTone(220, 75, 0.45, 'sawtooth', 0.11);
      setTimeout(() => this.playTone(523.25, 783.99, 0.28, 'triangle', 0.09), 150);
    } else {
      this.playTone(340, 520, 0.07, 'sine', 0.038);
    }
  }

  public playWaveStart() {
    this.playTone(220, 330, 0.22, 'sawtooth', 0.065);
    setTimeout(() => this.playTone(330, 440, 0.26, 'triangle', 0.075), 140);
  }

  public playBossWarning() {
    this.playTone(146, 98, 0.35, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(146, 98, 0.35, 'sawtooth', 0.1), 320);
  }

  public playCastleHit() {
    this.playTone(140, 60, 0.2, 'sawtooth', 0.09);
  }

  public playMcqCorrect() {
    this.playTone(523.25, 659.25, 0.12, 'sine', 0.08);
    setTimeout(() => this.playTone(659.25, 783.99, 0.15, 'sine', 0.08), 90);
  }

  public playMcqWrong() {
    this.playTone(240, 175, 0.22, 'triangle', 0.07);
  }

  public playVictory() {
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, n, 0.24, 'triangle', 0.09), i * 110);
    });
  }

  public playDefeat() {
    const notes = [293.66, 261.63, 220.0, 164.81];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, n * 0.92, 0.28, 'sawtooth', 0.08), i * 140);
    });
  }
}

export const dkAudio = new DarkKingdomAudio();

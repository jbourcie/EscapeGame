// Optional local synthesis. A context is created only inside a user gesture.
export const SOUND_KEY = 'abbadia-sound';
export function loadSound(): boolean {
  try { return localStorage.getItem(SOUND_KEY) === 'on'; } catch { return false; }
}
export class FinaleAudio {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  unlock() {
    try {
      if (!this.context && typeof window.AudioContext === 'function') this.context = new window.AudioContext();
      void this.context?.resume().catch(() => {});
    } catch { /* Audio is optional, including when a browser denies it. */ }
  }
  tone(frequency: number, seconds = .22, rising = false) {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, now);
      if (rising) oscillator.frequency.linearRampToValueAtTime(frequency * 2, now + seconds);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.045, now + .04);
      gain.gain.linearRampToValueAtTime(0, now + seconds);
      oscillator.connect(gain); gain.connect(context.destination);
      this.voices.add(oscillator);
      oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(); oscillator.stop(now + seconds);
    } catch { /* Synthesis failure must never interrupt the finale. */ }
  }
  stop() { for (const voice of this.voices) { try { voice.stop(); } catch { /* Already stopped. */ } } }
  close() {
    this.stop();
    const context = this.context; this.context = null;
    if (context) void context.close().catch(() => {});
  }
}

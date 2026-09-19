// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { FinaleAudio, loadSound } from './audio';
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); });
it('reste silencieux sans geste et tolère Web Audio absent', () => {
  vi.stubGlobal('AudioContext', undefined);
  const audio = new FinaleAudio();
  expect(() => { audio.tone(220); audio.unlock(); audio.tone(220); audio.stop(); audio.close(); }).not.toThrow();
});
it('crée sur geste, synthétise localement et ferme les oscillateurs et le contexte', () => {
  const oscillator = { type: '', frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: () => {} };
  const gain = { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
  const close = vi.fn().mockResolvedValue(undefined), resume = vi.fn().mockResolvedValue(undefined), create = vi.fn();
  vi.stubGlobal('AudioContext', class { state = 'running'; currentTime = 0; destination = {}; constructor() { create(); } resume = resume; close = close; createOscillator = () => oscillator; createGain = () => gain; });
  const audio = new FinaleAudio(); audio.tone(100); expect(create).not.toHaveBeenCalled();
  audio.unlock(); audio.unlock(); expect(create).toHaveBeenCalledTimes(1);
  audio.tone(100, 2, true); expect(oscillator.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(200, 2);
  audio.close(); expect(close).toHaveBeenCalledTimes(1); expect(oscillator.stop).toHaveBeenCalled();
  oscillator.onended(); expect(gain.disconnect).toHaveBeenCalled(); expect(oscillator.disconnect).toHaveBeenCalled();
});
it('reste utilisable si la préférence locale est inaccessible', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage unavailable'); });
  expect(loadSound()).toBe(false);
});

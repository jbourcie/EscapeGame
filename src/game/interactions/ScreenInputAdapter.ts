import type { MissionEvent, MissionInputAdapter } from './types';

export class ScreenInputAdapter implements MissionInputAdapter {
  private listeners = new Set<(event: MissionEvent) => void>();

  emit(event: MissionEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  reset() {
    this.emit({ type: 'reset' });
  }

  subscribe(callback: (event: MissionEvent) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

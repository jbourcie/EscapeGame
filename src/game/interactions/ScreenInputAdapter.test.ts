import { describe, expect, it, vi } from 'vitest';
import { ScreenInputAdapter } from './ScreenInputAdapter';

describe('adaptateur d’entrée écran', () => {
  it('transmet sélection, placement et remise à zéro sans dépendance matérielle', () => {
    const adapter = new ScreenInputAdapter();
    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);

    adapter.emit({ type: 'select', itemId: 'processor' });
    adapter.emit({ type: 'place', itemId: 'processor', targetId: 'compute' });
    adapter.reset();

    expect(listener).toHaveBeenNthCalledWith(1, { type: 'select', itemId: 'processor' });
    expect(listener).toHaveBeenNthCalledWith(2, { type: 'place', itemId: 'processor', targetId: 'compute' });
    expect(listener).toHaveBeenNthCalledWith(3, { type: 'reset' });
    unsubscribe();
    adapter.reset();
    expect(listener).toHaveBeenCalledTimes(3);
  });
});

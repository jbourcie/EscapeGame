import { describe, expect, it } from 'vitest';
import { missions } from '../data/missions';
import { initialProgress } from '../game/progress';
import { durations, finaleCode, finaleReducer, initialFinale, type FinalePhase, type FinaleState } from './machine';
const next = (state: FinaleState) => finaleReducer(state, { type: 'NEXT' });
describe('machine du réveil', () => {
  it('exige les six fragments réels même si les missions sont marquées terminées', () => {
    const p = { ...initialProgress(), completed: missions.map(m => m.id) };
    expect(finaleCode(p)).toBeNull();
    p.fragments = Object.fromEntries(missions.map(m => [m.id, m.answer]));
    expect(finaleCode(p)).toBe('472596');
    p.fragments.ai = '0'; expect(finaleCode(p)).toBeNull();
  });
  it('insère une seule fois six fragments avant de rendre la main', () => {
    let state = next(next(initialFinale()));
    expect(state.phase).toBe('fragments');
    for (let i = 1; i <= 6; i++) { state = next(state); expect(state.inserted).toBe(i); }
    expect(state.phase).toBe('ready'); expect(next(state)).toEqual(state);
  });
  it('ne saute pas le geste et ignore les événements hors de leur état', () => {
    for (const type of ['HOLD', 'ACTIVATE', 'RELEASE', 'REPLAY'] as const) expect(finaleReducer(initialFinale(), { type })).toEqual(initialFinale());
    expect(finaleReducer(initialFinale(), { type: 'CHARGE', elapsed: 2000 })).toEqual(initialFinale());
  });
  it('ignore une seconde charge et une charge devenue obsolète', () => {
    const charging: FinaleState = { phase: 'charging', inserted: 6, charge: 50, retried: false };
    expect(finaleReducer(charging, { type: 'HOLD' })).toEqual(charging);
    const released = finaleReducer(charging, { type: 'RELEASE' });
    expect(released.phase).toBe('ready'); expect(released.charge).toBe(0);
    expect(finaleReducer(released, { type: 'CHARGE', elapsed: 2000 })).toEqual(released);
  });
  it('parcourt le crescendo et termine avec un état complet', () => {
    let state: FinaleState = { phase: 'charging', inserted: 6, charge: 0, retried: false };
    state = finaleReducer(state, { type: 'CHARGE', elapsed: 2000 });
    for (const phase of ['awakening', 'observatory', 'constellation', 'illuminated', 'summary']) {
      expect(state.phase).toBe(phase); expect(state.charge).toBe(100); state = next(state);
    }
    expect(finaleReducer(state, { type: 'REPLAY' })).toEqual(initialFinale());
  });
  it.each<FinalePhase>(['idle','dimming','fragments','ready','charging','awakening','observatory','constellation','illuminated'])('passe depuis %s vers un bilan complet', phase => {
    expect(finaleReducer({ phase, inserted: 2, charge: 20, retried: true }, { type: 'SKIP' })).toEqual({ phase: 'summary', inserted: 6, charge: 100, retried: false });
  });
  it('prévoit 32 secondes hors attente et bilan, dont deux pour le geste', () => {
    expect(durations.idle! + durations.dimming! + durations.fragments! * 6 + 2000 + durations.awakening! + durations.observatory! + durations.constellation! + durations.illuminated!).toBe(32000);
  });
});

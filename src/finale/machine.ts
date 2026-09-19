import { finalCode, missions } from '../data/missions';
import { isFinaleUnlocked, type Progress } from '../game/progress';

export type FinalePhase = 'idle' | 'dimming' | 'fragments' | 'ready' | 'charging' | 'awakening' | 'observatory' | 'constellation' | 'illuminated' | 'summary';
export type FinaleState = { phase: FinalePhase; inserted: number; charge: number; retried: boolean };
export type FinaleEvent = { type: 'NEXT' | 'HOLD' | 'RELEASE' | 'ACTIVATE' | 'SKIP' | 'REPLAY' } | { type: 'CHARGE'; elapsed: number };
export const HOLD_MS = 2000;
export const durations: Partial<Record<FinalePhase, number>> = {
  idle: 1200, dimming: 2800, fragments: 1000,
  awakening: 5000, observatory: 5000, constellation: 5000, illuminated: 5000,
};
export const initialFinale = (): FinaleState => ({ phase: 'idle', inserted: 0, charge: 0, retried: false });
export function finaleCode(progress: Progress): string | null {
  const code = missions.map(mission => progress.fragments[mission.id] ?? '').join('');
  return isFinaleUnlocked(progress) && missions.every(m => progress.fragments[m.id] === m.answer) && code === finalCode ? code : null;
}
export function finaleReducer(state: FinaleState, event: FinaleEvent): FinaleState {
  if (event.type === 'SKIP') return { phase: 'summary', inserted: 6, charge: 100, retried: false };
  if (event.type === 'REPLAY') return state.phase === 'summary' ? initialFinale() : state;
  if (event.type === 'HOLD') return state.phase === 'ready' ? { ...state, phase: 'charging', charge: 0 } : state;
  if (event.type === 'RELEASE') return state.phase === 'charging' ? { ...state, phase: 'ready', charge: 0, retried: true } : state;
  if (event.type === 'ACTIVATE') return state.phase === 'ready' ? { ...state, phase: 'awakening', charge: 100 } : state;
  if (event.type === 'CHARGE') {
    if (state.phase !== 'charging') return state;
    const charge = Math.max(state.charge, Math.min(100, event.elapsed / HOLD_MS * 100));
    return { ...state, charge, phase: charge === 100 ? 'awakening' : 'charging' };
  }
  const next: Partial<Record<FinalePhase, FinalePhase>> = {
    idle: 'dimming', dimming: 'fragments', awakening: 'observatory',
    observatory: 'constellation', constellation: 'illuminated', illuminated: 'summary',
  };
  if (state.phase === 'fragments') {
    const inserted = Math.min(6, state.inserted + 1);
    return { ...state, inserted, phase: inserted === 6 ? 'ready' : 'fragments' };
  }
  return next[state.phase] ? { ...state, phase: next[state.phase]! } : state;
}

export const discoveries = [
  ['Composants', 'construisent'], ['Programme', 'commande'], ['Mémoire', 'conserve'],
  ['Données', 'représentent'], ['Objets connectés', 'observent et agissent'],
  ['Intelligence artificielle', 'apprend avec des exemples et peut se tromper'],
] as const;

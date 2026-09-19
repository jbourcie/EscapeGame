// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Finale } from './Finale';
import { initialProgress, type Progress } from '../game/progress';
import { missions } from '../data/missions';
import { FinaleAudio } from './audio';
const complete = (): Progress => ({ ...initialProgress(), level: 'scientist', completed: missions.map(m => m.id), fragments: Object.fromEntries(missions.map(m => [m.id, m.answer])) });
const mount = (motion = true, progress = complete()) => render(<Finale progress={progress} motion={motion} onBack={vi.fn()} onNewTeam={vi.fn()}/>);
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const phase = () => document.querySelector('[data-phase]')?.getAttribute('data-phase');
const hold = () => screen.getByRole('button', { name: /Maintiens pour activer/ });
function ready() { for (const ms of [1200, 2800, 1000, 1000, 1000, 1000, 1000, 1000]) tick(ms); }
beforeEach(() => {
  vi.useFakeTimers(); localStorage.clear();
  // jsdom has no PointerEvent constructor; preserve pointer identity and primary button semantics.
  class TestPointerEvent extends MouseEvent {
    pointerId: number; pointerType: string; isPrimary: boolean;
    constructor(type: string, params: PointerEventInit = {}) { super(type, params); this.pointerId = params.pointerId ?? 1; this.pointerType = params.pointerType ?? 'mouse'; this.isPrimary = params.isPrimary ?? true; }
  }
  vi.stubGlobal('PointerEvent', TestPointerEvent);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
it.each([0, 5])('ne monte aucun contrôle ni timer avec %i fragments', count => {
  const p = complete(); p.completed = p.completed.slice(0, count); mount(true, p);
  expect(phase()).toBeUndefined(); expect(screen.queryByText('Passer')).toBeNull(); tick(0); expect(vi.getTimerCount()).toBe(0);
});
it('insère 4, 7, 2, 5, 9, 6 et affiche ensuite le contrôle avec focus', () => {
  mount(); expect(phase()).toBe('idle'); tick(1200); expect(phase()).toBe('dimming'); tick(2800);
  for (const mission of missions) { expect(screen.queryByRole('button', { name: /Maintiens/ })).toBeNull(); tick(1000); expect(screen.getByLabelText(`${mission.shortTitle} : fragment ${mission.answer} installé`)).toBeTruthy(); }
  expect(phase()).toBe('ready'); expect(document.activeElement).toBe(hold());
  expect([...document.querySelectorAll('.awakening-socket b')].map(e => e.textContent).join('')).toBe('472596');
});
it.each(['mouse','touch'])('active après deux secondes au pointeur %s', pointerType => {
  mount(); ready(); fireEvent.pointerDown(hold(), { pointerType, pointerId: 2, button: 0 });
  tick(1950); expect(phase()).toBe('charging'); expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('97.5');
  tick(50); expect(phase()).toBe('awakening'); expect(screen.queryByRole('progressbar')).toBeNull();
});
it.each(['Enter', ' '])('active par maintien de la touche %s', key => {
  mount(); ready(); fireEvent.keyDown(hold(), { key }); tick(2000); expect(phase()).toBe('awakening');
});
it('un maintien trop court redescend sans pénalité et peut être repris', () => {
  mount(); ready(); fireEvent.pointerDown(hold()); tick(800); fireEvent.pointerUp(hold());
  expect(phase()).toBe('ready'); expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  expect(screen.getByText(/Encore un petit effort/)).toBeTruthy();
  tick(3000); expect(phase()).toBe('ready'); fireEvent.pointerDown(hold()); tick(2000); expect(phase()).toBe('awakening');
});
it.each(['pointerCancel','pointerLeave','lostPointerCapture','blur'])('annule sur %s', event => {
  mount(); ready(); fireEvent.pointerDown(hold()); tick(500);
  fireEvent[event as 'pointerCancel'](hold()); tick(3000); expect(phase()).toBe('ready');
});
it.each(['window-blur','hidden','keyup'])('annule sur interruption %s', interruption => {
  mount(); ready(); fireEvent.keyDown(hold(), { key: 'Enter' }); tick(500);
  if (interruption === 'keyup') fireEvent.keyUp(hold(), { key: 'Enter' });
  else if (interruption === 'window-blur') fireEvent.blur(window);
  else { vi.spyOn(document, 'hidden', 'get').mockReturnValue(true); fireEvent(document, new Event('visibilitychange')); }
  tick(3000); expect(phase()).toBe('ready');
});
it('ignore le deuxième doigt, les répétitions clavier et le clic secondaire', () => {
  mount(); ready(); fireEvent.pointerDown(hold(), { button: 2 }); expect(phase()).toBe('ready');
  fireEvent.pointerDown(hold(), { pointerId: 1 }); tick(1000);
  fireEvent.pointerDown(hold(), { pointerId: 2, isPrimary: false }); fireEvent.pointerUp(hold(), { pointerId: 2 });
  fireEvent.keyDown(hold(), { key: ' ', repeat: true }); tick(1000); expect(phase()).toBe('awakening');
});
it('révèle le code puis les six découvertes et exactement trois actions principales', () => {
  mount(); ready(); fireEvent.click(screen.getByRole('button', { name: 'Activer sans maintien' }));
  expect(phase()).toBe('awakening'); tick(5000); expect(phase()).toBe('observatory'); tick(5000); expect(phase()).toBe('constellation');
  expect(screen.getByLabelText('Code scientifique reconstitué').textContent).toContain('472596');
  tick(5000); expect(phase()).toBe('illuminated'); tick(5000); expect(phase()).toBe('summary');
  expect(document.activeElement).toBe(screen.getByRole('heading'));
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(document.querySelectorAll('.awakening-final-actions button')).toHaveLength(3); tick(0); expect(vi.getTimerCount()).toBe(0);
});
it.each(['idle','dimming','fragments','ready','charging','awakening','observatory','constellation','illuminated'])('Passer fonctionne dans l’interface depuis %s', target => {
  mount();
  if (target !== 'idle') tick(1200);
  if (!['idle','dimming'].includes(target)) tick(2800);
  if (!['idle','dimming','fragments'].includes(target)) for (let i=0;i<6;i++) tick(1000);
  if (['charging','awakening','observatory','constellation','illuminated'].includes(target)) { fireEvent.pointerDown(hold()); if (target !== 'charging') tick(2000); }
  for (let i=0;i<['observatory','constellation','illuminated'].indexOf(target)+1;i++) tick(5000);
  expect(phase()).toBe(target); fireEvent.click(screen.getByText('Passer'));
  expect(phase()).toBe('summary'); expect(screen.getByLabelText('Code scientifique').textContent).toBe('472596'); tick(0); expect(vi.getTimerCount()).toBe(0);
});
it('mode réduit : six systèmes successifs, geste adapté, constellation et bilan sans attente', () => {
  mount(false); tick(0); expect(vi.getTimerCount()).toBe(0);
  for (let i=0;i<8;i++) fireEvent.click(screen.getByText('Continuer le réveil'));
  expect(phase()).toBe('ready'); fireEvent.click(screen.getByText('Activer sans maintien'));
  for (let i=0;i<4;i++) fireEvent.click(screen.getByText('Continuer le réveil'));
  expect(phase()).toBe('summary'); tick(0); expect(vi.getTimerCount()).toBe(0);
});
it('réagit au changement de préférence système et nettoie son écouteur', () => {
  let listener = () => {}; const removeEventListener = vi.fn();
  const query = { matches: false, addEventListener: (_name: string, handler: () => void) => { listener = handler; }, removeEventListener };
  vi.stubGlobal('matchMedia', () => query); const view = mount();
  act(() => { query.matches = true; listener(); });
  tick(0); expect(vi.getTimerCount()).toBe(0); expect(screen.getByText('Continuer le réveil')).toBeTruthy();
  view.unmount(); expect(removeEventListener).toHaveBeenCalledWith('change', listener);
});
it.each(['automatic','charge'])('nettoie les timers et audio au démontage pendant %s', stage => {
  const close = vi.spyOn(FinaleAudio.prototype, 'close'); const view = mount();
  if (stage === 'charge') { ready(); fireEvent.pointerDown(hold()); tick(500); }
  expect(vi.getTimerCount()).toBeGreaterThan(0); view.unmount(); tick(0); expect(vi.getTimerCount()).toBe(0); expect(close).toHaveBeenCalled();
});
it('rejoue seulement la cinématique et préserve intégralement la progression', () => {
  const progress = complete(), before = structuredClone(progress); mount(true, progress);
  fireEvent.click(screen.getByText('Passer')); fireEvent.click(screen.getByText('Rejouer le réveil'));
  expect(phase()).toBe('idle'); expect(document.querySelectorAll('.is-installed')).toHaveLength(0); expect(progress).toEqual(before);
});
it('son coupé par défaut, choix local conservé, aucun contexte avant un geste', () => {
  const unlock = vi.spyOn(FinaleAudio.prototype, 'unlock'); mount();
  expect(screen.getByText('Son coupé')).toBeTruthy(); expect(unlock).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Son coupé')); expect(localStorage.getItem('abbadia-sound')).toBe('on'); expect(unlock).toHaveBeenCalledTimes(1);
  cleanup(); mount(); expect(screen.getByText('Son activé')).toBeTruthy(); expect(unlock).toHaveBeenCalledTimes(1);
  ready(); fireEvent.pointerDown(hold()); expect(unlock).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByText('Son activé')); expect(localStorage.getItem('abbadia-sound')).toBe('off');
});
it('annule quand un doigt sous capture implicite sort du contrôle', () => {
  mount(); ready(); const control = hold();
  vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({ left: 10, right: 200, top: 10, bottom: 100 } as DOMRect);
  fireEvent.pointerDown(control, { pointerType: 'touch', pointerId: 7 }); tick(500);
  fireEvent.pointerMove(control, { pointerType: 'touch', pointerId: 7, clientX: 220, clientY: 50 }); tick(2000);
  expect(phase()).toBe('ready');
});

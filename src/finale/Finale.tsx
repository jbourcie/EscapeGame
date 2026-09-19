import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { CentralMachine, GuideCharacter, MachineCore, ModuleIcon } from '../components/Observatory';
import { missions } from '../data/missions';
import type { Progress } from '../game/progress';
import { discoveries, durations, finaleCode, finaleReducer, initialFinale, type FinalePhase } from './machine';
import { FinaleAudio, loadSound, SOUND_KEY } from './audio';
import './finale.css';

const narration: Record<FinalePhase, string> = {
  idle: 'Les six fragments sont réunis…',
  dimming: 'La Machine d’Abbadia attend son activation !',
  fragments: 'Chaque découverte réveille un système.',
  ready: 'Tous les systèmes sont prêts. À toi de réveiller la machine !',
  charging: 'Garde le contrôle appuyé… l’énergie rejoint le cœur !',
  awakening: 'Le cœur s’éveille… Les six systèmes travaillent ensemble !',
  observatory: 'L’observatoire s’ouvre. Regarde vers les étoiles !',
  constellation: 'Les découvertes dessinent une nouvelle constellation.',
  illuminated: 'La Machine d’Abbadia est réveillée ! L’informatique est partout.',
  summary: 'Mission accomplie au château d’Abbadia !',
};
const systemEffects = ['Châssis assemblé', 'Engrenages en mouvement', 'Mémoire illuminée', 'Impulsions binaires', 'Instruments reliés', 'Analyse stabilisée'];

function useReducedMotion(motion: boolean) {
  const [system, setSystem] = useState(() => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setSystem(Boolean(query?.matches));
    query?.addEventListener?.('change', update);
    return () => query?.removeEventListener?.('change', update);
  }, []);
  return !motion || system;
}

export function Finale({ progress, onBack, onNewTeam, motion }: { progress: Progress; onBack: () => void; onNewTeam: () => void; motion: boolean }) {
  const code = finaleCode(progress);
  // No machine, timers, skip or activation controls can mount with invalid fragments.
  return code ? <Awakening progress={progress} code={code} onBack={onBack} onNewTeam={onNewTeam} motion={motion}/> :
    <section className="panel"><h1>La machine attend ses six fragments</h1><p>Retourne au laboratoire pour réunir les six découvertes.</p><button className="button" onClick={onBack}>Retour au laboratoire</button></section>;
}

function Awakening({ progress, code, onBack, onNewTeam, motion }: { progress: Progress; code: string; onBack: () => void; onNewTeam: () => void; motion: boolean }) {
  const [state, dispatch] = useReducer(finaleReducer, undefined, initialFinale);
  const reduced = useReducedMotion(motion);
  const [sound, setSound] = useState(loadSound);
  const audio = useRef(new FinaleAudio());
  const held = useRef<string | null>(null);
  const holdButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;
  const { phase, inserted } = state;
  const summary = phase === 'summary';
  const sky = ['observatory', 'constellation', 'illuminated', 'summary'].includes(phase);
  const revealed = ['constellation', 'illuminated', 'summary'].includes(phase);
  const automatic = durations[phase] !== undefined;

  useEffect(() => {
    const duration = durations[phase];
    if (duration === undefined || reduced) return;
    const timer = window.setTimeout(() => dispatch({ type: 'NEXT' }), duration);
    return () => window.clearTimeout(timer);
  }, [phase, inserted, reduced]);
  useEffect(() => {
    if (phase !== 'charging') { held.current = null; return; }
    const start = Date.now();
    const timer = window.setInterval(() => dispatch({ type: 'CHARGE', elapsed: Date.now() - start }), 50);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'ready') holdButton.current?.focus({ preventScroll: true });
    if (phase === 'summary') heading.current?.focus({ preventScroll: true });
  }, [phase]);
  useEffect(() => {
    if (!sound) return;
    if ((phase === 'fragments' || phase === 'ready') && inserted > 0) audio.current.tone(220 + inserted * 55);
    if (phase === 'charging') audio.current.tone(100, 2, true);
    if (phase === 'awakening') { audio.current.stop(); audio.current.tone(330, 1); }
    if (phase === 'illuminated') [262, 330, 392].forEach(note => audio.current.tone(note, 1.5));
  }, [phase, inserted, sound]);
  useEffect(() => {
    const engine = audio.current;
    const cancel = () => { held.current = null; dispatch({ type: 'RELEASE' }); engine.stop(); };
    const hidden = () => { if (document.hidden) cancel(); };
    window.addEventListener('blur', cancel); document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('blur', cancel); document.removeEventListener('visibilitychange', hidden); engine.close(); };
  }, []);
  function start(source: string) {
    if (phaseRef.current !== 'ready' || held.current !== null) return;
    held.current = source;
    if (sound) audio.current.unlock();
    dispatch({ type: 'HOLD' });
  }
  function cancel(source?: string) {
    if (source && held.current !== source) return;
    held.current = null; audio.current.stop(); dispatch({ type: 'RELEASE' });
  }
  function skip() { held.current = null; audio.current.close(); dispatch({ type: 'SKIP' }); }
  function toggleSound() {
    const next = !sound; setSound(next);
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* In-memory preference still works. */ }
    if (next) { audio.current.unlock(); audio.current.tone(330); } else audio.current.close();
  }
  const message = phase === 'ready' && state.retried ? 'Encore un petit effort : maintiens jusqu’au réveil !' : phase === 'fragments' && inserted > 0 ? `${missions[inserted - 1].shortTitle} — ${systemEffects[inserted - 1]}` : narration[phase];

  return <section className={`awakening awakening--${phase}${reduced ? ' awakening--reduced' : ''}`} data-phase={phase} aria-label="Le Réveil d’Abbadia">
    <header className="awakening-heading"><div><p className="eyebrow">{summary ? 'Six mécanismes restaurés' : 'Le laboratoire · Séquence finale'}</p><h1 ref={heading} tabIndex={-1}>{summary ? 'MACHINE RÉVEILLÉE' : 'Le Réveil d’Abbadia'}</h1></div><div className="awakening-tools"><button className="button button--quiet" onClick={toggleSound} aria-pressed={sound}>{sound ? 'Son activé' : 'Son coupé'}</button>{!summary && <button className="button button--quiet" onClick={skip}>Passer</button>}</div></header>
    <div className="awakening-guide"><GuideCharacter mood={summary ? 'success' : sky || phase === 'idle' ? 'surprise' : 'encourage'}/><p role="status" aria-live="polite">{message}</p></div>
    {summary ? <>
      <div className="awakening-victory"><img src="/assets/abbadia-night.svg" alt="Abbadia illuminé, entre océan et étoiles"/><MachineCore awake/><div><p className="eyebrow">Code scientifique</p><output aria-label="Code scientifique">{code}</output><p>Six mécanismes restaurés</p></div></div>
      <ul className="awakening-discoveries" aria-label="Nos six découvertes">{discoveries.map(([title, verb], index) => <li key={title}><ModuleIcon id={missions[index].id}/><span><b>{title}</b>{verb}</span></li>)}</ul>
      <p className="awakening-lesson">{progress.level === 'explorer' ? 'Tu as trouvé le code et découvert comment réveiller les machines numériques !' : progress.level === 'expert' ? 'Tu as reconstitué le code et compris comment matériel, programmes et données coopèrent pour faire fonctionner les systèmes numériques.' : 'Tu n’as pas seulement trouvé un code. Tu as compris comment les machines numériques prennent vie.'}</p>
      <div className="awakening-final-actions"><button className="button button--primary" onClick={() => { audio.current.close(); dispatch({ type: 'REPLAY' }); }}>Rejouer le réveil</button><button className="button button--secondary" onClick={onBack}>Revoir une mission</button><button className="button button--quiet" onClick={onNewTeam}>Accueillir une nouvelle équipe</button></div>
    </> : <>
      <div className={`awakening-stage${sky ? ' is-sky' : ''}${revealed ? ' is-revealed' : ''}`} aria-label={sky ? 'Le château-observatoire ouvert vers le ciel' : 'La machine centrale et ses six emplacements'}>
        <div className="awakening-sky" aria-hidden="true"><div className="awakening-aperture"/><div className="awakening-beam"/></div>
        <div className="awakening-constellation" aria-hidden="true"><svg viewBox="0 0 600 100" preserveAspectRatio="none"><path d="M50 65 150 25 250 60 350 20 450 60 550 30"/></svg>{missions.map((m, i) => <span key={m.id} style={{ '--star': i } as CSSProperties}><i>✦</i><b>{progress.fragments[m.id]}</b></span>)}</div>
        <div className="awakening-castle" aria-hidden="true"><img src="/assets/abbadia-night.svg" alt=""/><svg className="awakening-windows" viewBox="0 0 800 700"><g className="castle-connections"><path d="M220 460H398V388H570V460M398 388V214"/></g>{[207, 239, 543, 575].map((x, i) => <path key={x} style={{ '--window': i } as CSSProperties} d={`M${x} 479v-35q10-21 20 0v35Z`}/>)}</svg><div className="awakening-castle-heart"><MachineCore awake/></div></div>
        <div className="awakening-machine"><CentralMachine progress={progress} activation={inserted}/><div className="awakening-sockets" aria-label="Insertion des fragments dans l’ordre des missions">{missions.map((m, i) => <div key={m.id} className={`awakening-socket module-${m.id}${i < inserted ? ' is-installed' : ''}`} style={{ '--slot': i } as CSSProperties} aria-label={`${m.shortTitle} : ${i < inserted ? `fragment ${progress.fragments[m.id]} installé` : 'en attente'}`}><b>{i < inserted ? progress.fragments[m.id] : '·'}</b><small>{m.shortTitle}</small><span className="system-effect" aria-hidden="true">{['▣', '⚙', '▥', '0101', '⌁', '◎'][i]}</span></div>)}</div></div>
        {revealed && <output className="awakening-code" aria-label="Code scientifique reconstitué">Code scientifique reconstitué : <b>{code}</b></output>}
      </div>
      <div className="awakening-controls">
        {(phase === 'ready' || phase === 'charging') ? <><div className="activation-meter" role="progressbar" aria-label="Énergie du cœur" aria-valuenow={state.charge} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${state.charge / 100})` }}/></div><button ref={holdButton} className="button button--primary activation-control" aria-describedby="activation-help"
          onPointerDown={event => { if (event.button !== 0 || event.isPrimary === false) return; event.preventDefault(); event.currentTarget.focus(); start(`pointer-${event.pointerId}`); }}
          onPointerMove={event => { if (held.current !== `pointer-${event.pointerId}`) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) cancel(); }}
          onPointerUp={event => cancel(`pointer-${event.pointerId}`)} onPointerCancel={event => cancel(`pointer-${event.pointerId}`)} onPointerLeave={event => cancel(`pointer-${event.pointerId}`)} onLostPointerCapture={event => cancel(`pointer-${event.pointerId}`)} onBlur={() => cancel()}
          onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) start(`key-${event.key}`); } }}
          onKeyUp={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); cancel(`key-${event.key}`); } }} onContextMenu={event => event.preventDefault()}>Maintiens pour activer <span aria-hidden="true">✦</span></button><p id="activation-help">{phase === 'charging' ? 'Continue de maintenir…' : 'Maintiens 2 secondes · doigt, souris, Entrée ou Espace'}</p><button className="activation-alternative" disabled={phase === 'charging'} onClick={() => { if (sound) audio.current.unlock(); dispatch({ type: 'ACTIVATE' }); }}>Activer sans maintien</button></> : <><p className="awakening-phase-label">{phase === 'fragments' ? `${inserted} / 6 systèmes activés` : phase === 'awakening' ? 'Énergie maximale · Activation en cours' : sky ? 'Les six découvertes éclairent Abbadia' : 'Six découvertes. Une machine à réveiller.'}</p>{reduced && automatic && <button className="button button--secondary" onClick={() => dispatch({ type: 'NEXT' })}>Continuer le réveil</button>}</>}
      </div>
    </>}
  </section>;
}

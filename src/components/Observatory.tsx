import type { CSSProperties, ReactNode } from 'react';
import { missions, type Mission } from '../data/missions';
import type { Progress } from '../game/progress';

export type GuideMood = 'neutral' | 'explain' | 'encourage' | 'error' | 'success' | 'surprise';
export function GuideCharacter({ mood = 'neutral' }: { mood?: GuideMood }) {
  return <svg className={`guide-character guide-character--${mood}`} viewBox="0 0 100 110" aria-hidden="true" fill="none">
    <path d="M50 17V5m-8 0h16M21 61 9 73l7 15m63-27 12 12-7 15M35 91l-6 13m36-13 6 13" stroke="#d6b47d" strokeWidth="5" strokeLinecap="round"/>
    <path d="M25 78q25-20 50 0l-5 18H30Z" fill="#214455" stroke="#d6b47d" strokeWidth="3"/>
    <circle cx="50" cy="47" r="32" fill="#112a3c" stroke="#d6b47d" strokeWidth="3"/>
    <ellipse cx="50" cy="47" rx="38" ry="20" transform="rotate(-25 50 47)" stroke="#b98957" strokeWidth="2"/>
    <path d="M28 38q22-16 44 0v23q-22 16-44 0Z" fill="#183e50" stroke="#789eaa"/>
    {mood === 'success' ? <path d="m32 48 5-5 5 5m16 0 5-5 5 5" stroke="#8df1df" strokeWidth="4" strokeLinecap="round"/> : <><ellipse cx="37" cy="48" rx="4" ry={mood === 'surprise' ? 8 : 5} fill="#8df1df"/><ellipse cx="63" cy="48" rx="4" ry={mood === 'surprise' ? 8 : 5} fill="#8df1df"/></>}
    {mood === 'surprise' ? <circle cx="50" cy="61" r="4" stroke="#8df1df" strokeWidth="2"/> : <path d={mood === 'error' ? 'M44 63q6-4 12 0' : 'M43 60q7 7 14 0'} stroke="#8df1df" strokeWidth="2" strokeLinecap="round"/>}
    <circle cx="50" cy="84" r="5" fill="#8df1df"/>
  </svg>;
}
export function InstructionPanel({ children, mood = 'explain' }: { children: ReactNode; mood?: GuideMood }) {
  return <div className="instruction-panel"><GuideCharacter mood={mood}/><div><span className="guide-name">Le gardien de l’observatoire</span><div>{children}</div></div></div>;
}
export function ModuleIcon({ id }: { id: string }) {
  const paths: Record<string, ReactNode> = {
    components: <><rect x="12" y="12" width="24" height="24" rx="3"/><rect x="18" y="18" width="12" height="12"/><path d="M17 6v6m7-6v6m7-6v6M17 36v6m7-6v6m7-6v6M6 17h6m-6 7h6m-6 7h6m24-14h6m-6 7h6m-6 7h6"/></>,
    program: <><path d="M10 9h16v10H10Zm12 20h16v10H22ZM26 14h10v10m-5-5 5 5 5-5M22 34H12V24m-5 5 5-5 5 5"/></>,
    memory: <><path d="M9 10h30v28H9Zm0 9h30M9 29h30M18 13h12m-12 10h12m-12 10h12"/><path d="M14 38v4m20-4v4"/></>,
    data: <><path d="M8 10h32v28H8ZM18 10v28m12-28v28M8 24h32"/><circle cx="13" cy="17" r="2"/><circle cx="24" cy="31" r="2"/><path d="M24 14v6m11 8v6"/></>,
    everywhere: <><circle cx="24" cy="24" r="6"/><circle cx="8" cy="9" r="4"/><circle cx="40" cy="9" r="4"/><circle cx="8" cy="39" r="4"/><circle cx="40" cy="39" r="4"/><path d="m11 12 9 8m8 0 9-8M11 36l9-8m8 0 9 8"/></>,
    ai: <><circle cx="24" cy="24" r="17"/><ellipse cx="24" cy="24" rx="9" ry="17"/><path d="M8 18h32M8 30h32"/><circle cx="24" cy="24" r="4"/></>,
  };
  return <svg className="module-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>;
}
export function MachineCore({ awake = false }: { awake?: boolean }) {
  return <div className={`astrolabe ${awake ? 'is-awake' : ''}`} aria-hidden="true"><div className="astrolabe__ring"/><div className="astrolabe__ring astrolabe__ring--inner"/><div className="astrolabe__lens"><span>✦</span></div><i/><i/><i/></div>;
}
export function FragmentCollection({ progress }: { progress: Progress }) {
  return <ol className="fragment-collection" aria-label="Fragments dans l’ordre des missions">{missions.map(m => <li key={m.id} className={progress.completed.includes(m.id) ? 'is-collected' : ''} aria-label={`${m.shortTitle} : ${progress.fragments[m.id] ?? 'à découvrir'}`}><small>0{m.order}</small><b>{progress.fragments[m.id] ?? '·'}</b></li>)}</ol>;
}
export function CentralMachine({ progress, onOpen, selected, activation }: { progress: Progress; onOpen?: (id: string) => void; selected?: string | null; activation?: number }) {
  return <div className="central-machine"><div className="central-machine__core"><MachineCore awake={activation === undefined ? progress.completed.length > 0 : activation >= 6}/><span>{progress.completed.length}/6</span></div>
    {missions.map((m, index) => {
      const done = progress.completed.includes(m.id);
      const started = progress.started.includes(m.id);
      const lit = activation === undefined ? done : index < activation;
      const content = <><span className="module-number">0{m.order}</span><ModuleIcon id={m.id}/><strong>{m.shortTitle}</strong><span className="module-state">{done ? `✓ Terminée · fragment ${progress.fragments[m.id]}` : started ? '◐ En cours' : '○ Disponible'}</span>{selected === m.id && <small>Dernier module sélectionné</small>}</>;
      const props = { className: `machine-module module-${m.id}${lit ? ' is-lit' : ''}`, style: { '--module-index': index } as CSSProperties };
      return onOpen ? <button {...props} key={m.id} aria-current={selected === m.id ? 'true' : undefined} onClick={() => onOpen(m.id)}>{content}</button> : <div {...props} key={m.id}>{content}</div>;
    })}
  </div>;
}
export function MissionHeader({ mission, children }: { mission: Mission; children?: ReactNode }) {
  return <header className={`digital-mission-header shared-mission-header module-${mission.id}`}><div className="mission-heading"><ModuleIcon id={mission.id}/><div><p className="eyebrow">Mécanisme {mission.order} · {mission.shortTitle}</p><h1>{mission.title}</h1></div></div>{children}</header>;
}
export function FragmentReveal({ mission }: { mission: Mission }) {
  return <div className="fragment-transfer" aria-label={`Fragment ${mission.answer} transmis à la machine centrale`}><span className="fragment-plaque">{mission.answer}</span><span className="fragment-transfer__beam" aria-hidden="true">········ →</span><span className="fragment-socket"><b>{mission.answer}</b><small>✓ Enregistré</small></span></div>;
}
export function CompletionPanel({ mission, title, children, onBack }: { mission: Mission; title: string; children?: ReactNode; onBack: () => void }) {
  return <section className="completion-panel" aria-live="polite"><GuideCharacter mood="success"/><div><p className="eyebrow">Fragment {mission.order} enregistré automatiquement</p><h2>{title}</h2><FragmentReveal mission={mission}/><div className="completion-learning">{children ?? <p>{mission.learning}</p>}</div><button className="button button--primary" onClick={onBack}>Retourner au laboratoire →</button></div></section>;
}

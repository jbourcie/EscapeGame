import { CentralMachine, FragmentCollection, GuideCharacter, InstructionPanel, MachineCore } from './components/Observatory';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearProgress, initialProgress, isFinaleUnlocked, loadProgress, saveProgress, startMission, type Progress } from './game/progress';
import { getMission, levels, type Level } from './data/missions';
import { ComponentMission } from './missions/components/ComponentMission';
import { ProgramMission } from './missions/program/ProgramMission';
import { MemoryMission } from './missions/memory/MemoryMission';
import { DataMission } from './missions/data/DataMission';
import { EverywhereMission } from './missions/everywhere/EverywhereMission';
import { Finale } from './finale/Finale';
import { finaleCode } from './finale/machine';
import { AIMission } from './missions/ai/AIMission';

type Screen = 'welcome' | 'level' | 'map' | 'mission' | 'finale';

function Shell({ children, progress, screen, aiMissionActive, onReset, onHome, motion, onMotion }: { children: React.ReactNode; progress: Progress; screen: Screen; aiMissionActive: boolean; onReset: () => void; onHome: () => void; motion: boolean; onMotion: () => void }) {
  const total = progress.completed.length;
  return (
    <div className={`app screen-${screen}${aiMissionActive ? ' app--ai' : ''}${motion ? '' : ' reduce-motion'}`}>
      <a className="skip-link" href="#main-content">Aller au contenu</a><div className="stars" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={onHome} aria-label="Retour à l’accueil">
          <span className="brand__mark">A</span><span>Observatoire<br /><b>Abbadia</b></span>
        </button>
        {progress.level && screen !== 'welcome' && (
          <div className="topbar__status" aria-label={`${total} modules réparés sur 6`}>
            <span>{total}/6 modules</span>
            <div className="mini-progress"><i style={{ width: `${(total / 6) * 100}%` }} /></div>
          </div>
        )}
        <div className="topbar__tools"><button className="button button--quiet" aria-pressed={!motion} onClick={onMotion}>Animations : {motion ? 'oui' : 'non'}</button>{screen !== 'finale' && (progress.level || progress.started.length > 0) && <button className="button button--quiet" onClick={onReset}>Nouvelle équipe</button>}</div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer>Nuit de la Recherche · UPPA — Hendaye · Disponible hors ligne après installation</footer>
    </div>
  );
}

function Welcome({ hasProgress, onStart, onResume }: { hasProgress: boolean; onStart: (level: Level) => void; onResume: () => void }) {
  const [level, setLevel] = useState<Level>('scientist');
  return <section className="welcome layout-split">
    <div className="welcome__copy"><p className="eyebrow">UPPA — Hendaye · Château-observatoire</p><h1>Le Mystère de la <br/><em>Machine d’Abbadia</em></h1><p className="welcome-subtitle">Une aventure scientifique de la Nuit de la Recherche</p><p className="lead">Dans le laboratoire d’Abbadia, une étrange machine s’est arrêtée. Explore ses six mécanismes, découvre l’informatique et retrouve les fragments nécessaires pour la réveiller.</p>{!hasProgress && <fieldset className="welcome-levels"><legend>Choisis ton niveau d’exploration</legend>{levels.map(item => <label key={item.id}><input aria-label={`${item.name} — ${item.age}`} type="radio" name="welcome-level" value={item.id} checked={level === item.id} onChange={() => setLevel(item.id)}/><span><b>{item.name}</b><small>{item.age}</small></span></label>)}</fieldset>}<div className="actions"><button className="button button--primary" onClick={hasProgress ? onResume : () => onStart(level)}>Entrer dans le laboratoire →</button>{hasProgress && <button className="button button--secondary" onClick={onResume}>Reprendre la partie</button>}</div><p className="helper">6 découvertes · 3 niveaux d’âge · À explorer en équipe</p><div className="welcome-guide"><GuideCharacter mood="encourage"/><p>« Le laboratoire t’attend.<br/>Chaque découverte rallumera la machine. »</p></div></div>
    <div className="observatory-scene"><img src="/assets/abbadia-night.svg" alt="Un château-observatoire sous les étoiles, face à l’océan. Une fenêtre du laboratoire brille."/><div className="welcome-machine"><MachineCore/><span>La machine attend ses six fragments</span></div><p className="scene-caption">Une nuit à Abbadia · Entre océan et étoiles</p></div>
  </section>;
}

function LevelChoice({ onChoose, onBack }: { onChoose: (level: Level) => void; onBack: () => void }) {
  return (
    <section className="panel panel--wide">
      <button className="back-link" onClick={onBack}>← Retour</button>
      <p className="eyebrow">Avant de commencer</p>
      <h1>Choisissez votre niveau d’exploration</h1>
      <p className="lead lead--small">Les six défis restent les mêmes. Seuls les mots et les coups de pouce s’adaptent à votre équipe.</p>
      <div className="level-grid">
        {levels.map((level) => (
          <button className="level-card" key={level.id} onClick={() => onChoose(level.id)}>
            <span className="level-card__symbol" aria-hidden="true">{level.symbol}</span>
            <span className="level-card__name">{level.name}</span>
            <span className="level-card__age">{level.age}</span>
            <span className="level-card__description">{level.description}</span>
            <span className="level-card__cta">Choisir ce niveau →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MissionMap({ progress, onOpen, onFinale, onLevel, selected }: { progress: Progress; onOpen: (id: string) => void; onFinale: () => void; onLevel: () => void; selected: string | null }) {
  const unlocked = finaleCode(progress) !== null;
  const level = levels.find(item => item.id === progress.level);
  return <section className="map-view panel panel--wide"><div className="section-heading"><div><p className="eyebrow">Le laboratoire d’Abbadia</p><h1>Réveille la machine</h1></div><button className="level-pill" onClick={onLevel} aria-label="Changer de niveau">{level?.name} · changer</button></div><InstructionPanel mood={progress.completed.length ? 'encourage' : 'explain'}><p>Choisis un mécanisme. Tu peux les explorer dans l’ordre que tu veux.</p></InstructionPanel><p className="machine-progress" role="status">{progress.completed.length} mécanisme{progress.completed.length === 1 ? '' : 's'} réveillé{progress.completed.length === 1 ? '' : 's'} sur 6</p><CentralMachine progress={progress} onOpen={onOpen} selected={selected}/><FragmentCollection progress={progress}/><button className={`final-gate ${unlocked ? 'final-gate--open' : ''}`} disabled={!unlocked} onClick={onFinale}><span aria-hidden="true">✦</span><span><b>{unlocked ? 'Le redémarrage est prêt !' : 'La machine attend ses six fragments'}</b><small>{unlocked ? 'Assembler les fragments et réveiller le château' : `${progress.completed.length}/6 fragments retrouvés · Tous les mécanismes sont accessibles`}</small></span><span aria-hidden="true">→</span></button></section>;
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const finalePresented = useRef(isFinaleUnlocked(progress));
  const [motion, setMotion] = useState(() => { try { return localStorage.getItem('abbadia-motion') !== 'off'; } catch { return true; } });
  const previousScreen = useRef<Screen>('welcome');
  const [replaying, setReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState<Progress>(() => initialProgress());
  const [screen, setScreen] = useState<Screen>('welcome');
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const activeMission = useMemo(() => activeMissionId ? getMission(activeMissionId) : undefined, [activeMissionId]);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => { try { localStorage.setItem('abbadia-motion', motion ? 'on' : 'off'); } catch { /* Preferences remain usable without storage. */ } }, [motion]);
  useEffect(() => {
    if (previousScreen.current === screen) return;
    previousScreen.current = screen;
    document.querySelector<HTMLElement>('#main-content')?.focus();
    window.scrollTo(0, 0);
  }, [screen]);
  function chooseLevel(level: Level) { setProgress({ ...progress, level }); setScreen('map'); }
  function openMission(id: string) { if (replaying) setReplayProgress({ ...initialProgress(), level: progress.level }); else setProgress(startMission(progress, id)); setActiveMissionId(id); setScreen('mission'); window.scrollTo(0, 0); }
  function reset() {
    if (!window.confirm('Effacer toute la progression de cette équipe ?')) return;
    clearProgress(); finalePresented.current = false; setProgress(initialProgress()); setReplaying(false); setActiveMissionId(null); setScreen('welcome');
  }
  const missionProgress = replaying ? replayProgress : progress;
  const updateMission = replaying ? setReplayProgress : setProgress;
  function returnToLab() {
    if (!replaying && !finalePresented.current && finaleCode(progress)) { finalePresented.current = true; setScreen('finale'); }
    else setScreen('map');
  }

  let content: React.ReactNode;
  if (screen === 'welcome') content = <Welcome hasProgress={Boolean(progress.level)} onStart={chooseLevel} onResume={() => setScreen(progress.level ? 'map' : 'level')} />;
  else if (screen === 'level') content = <LevelChoice onChoose={chooseLevel} onBack={() => setScreen('welcome')} />;
  else if (screen === 'map') content = <MissionMap progress={progress} onOpen={openMission} onFinale={() => { if (finaleCode(progress)) { finalePresented.current = true; setReplaying(false); setScreen('finale'); } }} onLevel={() => setScreen('level')} selected={activeMissionId} />;
  else if (screen === 'mission' && activeMission?.id === 'components') content = <ComponentMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else if (screen === 'mission' && activeMission?.id === 'program') content = <ProgramMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else if (screen === 'mission' && activeMission?.id === 'memory') content = <MemoryMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else if (screen === 'mission' && activeMission?.id === 'data') content = <DataMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else if (screen === 'mission' && activeMission?.id === 'everywhere') content = <EverywhereMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else if (screen === 'mission' && activeMission?.id === 'ai') content = <AIMission key={activeMission.id} mission={activeMission} progress={missionProgress} onProgress={updateMission} onBack={returnToLab} />;
  else content = <Finale progress={progress} onBack={() => { setReplaying(true); setScreen('map'); }} onNewTeam={reset} motion={motion} />;

  return <Shell progress={progress} screen={screen} aiMissionActive={screen === 'mission' && activeMissionId === 'ai'} onReset={reset} onHome={() => { setReplaying(false); setScreen('welcome'); }} motion={motion} onMotion={() => setMotion(value => !value)}>{replaying && screen !== 'welcome' && <p className="replay-notice">Entraînement libre · Les six fragments de ton équipe restent enregistrés.</p>}{content}</Shell>;
}

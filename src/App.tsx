import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { ambiguousObservation, balancedTraining, biasedTraining, classify, clearObservation } from './game/classifier';
import { clearProgress, initialProgress, isFinaleUnlocked, loadProgress, saveProgress, startMission, validateFragment, type Progress } from './game/progress';
import { finalCode, getMission, levels, missions, type Level, type Mission } from './data/missions';
import { ComponentMission } from './missions/components/ComponentMission';
import { ProgramMission } from './missions/program/ProgramMission';
import { MemoryMission } from './missions/memory/MemoryMission';

type Screen = 'welcome' | 'level' | 'map' | 'mission' | 'finale' | 'victory';

function Machine({ running = false }: { running?: boolean }) {
  return (
    <div className={`machine ${running ? 'machine--running' : ''}`} role="img" aria-label={running ? 'La machine scientifique redémarre sous un ciel lumineux' : 'Une machine scientifique arrêtée sous un ciel étoilé'}>
      <div className="machine__orbit"><i /><i /><i /></div>
      <div className="machine__tower">
        <span className="machine__dial"><b>{running ? 'ON' : 'OFF'}</b></span>
        <span className="machine__line" />
        <span className="machine__line machine__line--short" />
      </div>
      <div className="machine__gear machine__gear--one">✹</div>
      <div className="machine__gear machine__gear--two">✹</div>
      <div className="machine__base" />
    </div>
  );
}

function Shell({ children, progress, screen, onReset }: { children: React.ReactNode; progress: Progress; screen: Screen; onReset: () => void }) {
  const total = progress.completed.length;
  return (
    <div className={`app screen-${screen}`}>
      <div className="stars" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => location.reload()} aria-label="Retour à l’accueil">
          <span className="brand__mark">A</span><span>Observatoire<br /><b>Abbadia</b></span>
        </button>
        {progress.level && screen !== 'welcome' && (
          <div className="topbar__status" aria-label={`${total} modules réparés sur 6`}>
            <span>{total}/6 modules</span>
            <div className="mini-progress"><i style={{ width: `${(total / 6) * 100}%` }} /></div>
          </div>
        )}
        {(progress.level || progress.started.length > 0) && <button className="button button--quiet" onClick={onReset}>Recommencer</button>}
      </header>
      <main>{children}</main>
      <footer>Prototype pédagogique • Fonctionne sans connexion après installation</footer>
    </div>
  );
}

function Welcome({ hasProgress, onStart, onResume }: { hasProgress: boolean; onStart: () => void; onResume: () => void }) {
  return (
    <section className="welcome layout-split">
      <div className="welcome__copy">
        <p className="eyebrow">Une aventure scientifique au château</p>
        <h1>Le dernier calcul<br /><em>d’Antoine d’Abbadie</em></h1>
        <p className="lead">La machine scientifique d’Antoine d’Abbadie s’est arrêtée. Répare ses six modules, retrouve les fragments du code et relance les observations du château.</p>
        <div className="actions">
          <button className="button button--primary" onClick={onStart}>{hasProgress ? 'Nouvelle mission' : 'Commencer la mission'} <span aria-hidden="true">→</span></button>
          {hasProgress && <button className="button button--secondary" onClick={onResume}>Reprendre la partie</button>}
        </div>
        <p className="helper"><span aria-hidden="true">◌</span> Six énigmes physiques • En équipe • Environ 30 minutes</p>
      </div>
      <div className="machine-stage"><Machine /><div className="machine-caption"><span className="status-dot" /> Système en sommeil</div></div>
    </section>
  );
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

function MissionMap({ progress, onOpen, onFinale, onLevel }: { progress: Progress; onOpen: (id: string) => void; onFinale: () => void; onLevel: () => void }) {
  const unlocked = isFinaleUnlocked(progress);
  const level = levels.find((item) => item.id === progress.level);
  return (
    <section className="map-view panel panel--wide">
      <div className="section-heading">
        <div><p className="eyebrow">Carte de la machine</p><h1>Quel module allez-vous réparer ?</h1></div>
        <button className="level-pill" onClick={onLevel} aria-label="Changer de niveau">{level?.symbol} {level?.name} · changer</button>
      </div>
      <p className="lead lead--small">Choisissez librement. Les modules numériques se jouent à l’écran ; les autres utilisent encore le matériel physique.</p>
      <div className="mission-grid">
        {missions.map((mission) => {
          const completed = progress.completed.includes(mission.id);
          const started = progress.started.includes(mission.id);
          const status = completed ? 'Validée' : started ? 'En cours' : 'Non commencée';
          return (
            <button className={`mission-card ${completed ? 'mission-card--done' : ''}`} onClick={() => onOpen(mission.id)} key={mission.id}>
              <span className="mission-card__number">0{mission.order}</span>
              <span className="mission-card__icon" aria-hidden="true">{mission.icon}</span>
              <span className="mission-card__title">{mission.shortTitle}</span>
              <span className="mission-card__status"><i aria-hidden="true">{completed ? '✓' : started ? '◐' : '○'}</i> {status}</span>
            </button>
          );
        })}
      </div>
      <button className={`final-gate ${unlocked ? 'final-gate--open' : ''}`} disabled={!unlocked} onClick={onFinale}>
        <span className="final-gate__icon" aria-hidden="true">{unlocked ? '✦' : '⌁'}</span>
        <span><b>{unlocked ? 'Le redémarrage est prêt !' : 'Redémarrage verrouillé'}</b><small>{unlocked ? 'Les six fragments sont réunis. Entrer le code final.' : `${progress.completed.length}/6 fragments retrouvés`}</small></span>
        <span aria-hidden="true">{unlocked ? '→' : '▱'}</span>
      </button>
    </section>
  );
}

function MissionVisual({ mission }: { mission: Mission }) {
  const motifs: Record<Mission['visual'], React.ReactNode> = {
    gears: <><b>CPU</b><i>RAM</i><i>SSD</i><i>⚡</i></>,
    path: <><span>↑</span><span>↱</span><span>↑</span><b>⌖</b></>,
    memory: <><b>TRAVAIL</b><i /><i /><span>ARCHIVES</span></>,
    binary: <><i>1</i><i>0</i><i>1</i><i>0</i></>,
    sensor: <><b>◉</b><span>→</span><i>⌘</i><span>→</span><strong>✦</strong></>,
    ai: <><i /><i /><b>⌬</b><i /><i /></>,
  };
  return <div className={`mission-visual visual-${mission.visual}`} role="img" aria-label={`Illustration temporaire : ${mission.shortTitle}`}>{motifs[mission.visual]}</div>;
}

function AISimulator({ done, onDone }: { done: boolean; onDone: () => void }) {
  const [mode, setMode] = useState<'intro' | 'clear' | 'biased'>(done ? 'biased' : 'intro');
  const clearResult = classify(clearObservation, balancedTraining);
  const biasedResult = classify(ambiguousObservation, biasedTraining);
  return (
    <div className="ai-lab">
      <div className="ai-lab__heading"><span aria-hidden="true">⌬</span><div><small>Expérience locale</small><h3>Dans la tête de la machine</h3></div></div>
      {mode === 'intro' && <><p>Chaque observation devient deux nombres : <b>luminosité</b> et <b>régularité</b>. La machine cherche les exemples les plus proches.</p><button className="button button--secondary" onClick={() => setMode('clear')}>Tester un cas clair</button></>}
      {mode === 'clear' && <>
        <div className="observation-result"><span className="observation-dot observation-dot--signal" /><div><small>Nouvelle observation · 8, 8</small><b>{clearObservation.name}</b></div><strong>→ {clearResult}</strong></div>
        <p>Les exemples proches sont réguliers et lumineux : la machine classe cette observation comme un <b>signal</b>.</p>
        <button className="button button--secondary" onClick={() => { setMode('biased'); onDone(); }}>Déséquilibrer les exemples</button>
      </>}
      {mode === 'biased' && <>
        <div className="training-balance" aria-label="Un exemple signal et quatre exemples parasites"><span className="signal" /> <span className="parasite" /><span className="parasite" /><span className="parasite" /><span className="parasite" /></div>
        <div className="observation-result observation-result--warning"><span className="observation-dot" /><div><small>Cas ambigu · 8, 7</small><b>{ambiguousObservation.name}</b></div><strong>→ {biasedResult}</strong></div>
        <p>Il y a beaucoup plus d’exemples « parasite ». Même proche d’un signal, le cas ambigu est entraîné vers la majorité. <b>Les données influencent la réponse.</b></p>
      </>}
    </div>
  );
}

function MissionScreen({ mission, progress, onProgress, onBack }: { mission: Mission; progress: Progress; onProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void }) {
  const level = progress.level ?? 'scientist';
  const completed = progress.completed.includes(mission.id);
  const [answer, setAnswer] = useState('');
  const [success, setSuccess] = useState(completed);
  const [message, setMessage] = useState('');
  const hintCount = progress.hints[mission.id] ?? 0;
  const maxHints = mission.hints[level].length;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = validateFragment(progress, mission.id, answer.trim());
    onProgress(result.progress);
    if (result.correct) {
      setSuccess(true);
      setMessage('');
    } else {
      setAnswer('');
      const attempts = result.progress.attempts[mission.id] ?? 1;
      setMessage(attempts === 1 ? 'Ce fragment ne réagit pas. Vérifie ta manipulation.' : 'Toujours pas. Un nouvel indice s’est allumé sous la console.');
    }
  }

  function revealHint() {
    if (hintCount >= maxHints) return;
    onProgress({ ...progress, hints: { ...progress.hints, [mission.id]: hintCount + 1 } });
  }

  return (
    <section className="mission-view panel panel--wide">
      <button className="back-link" onClick={onBack}>← Retour à la carte</button>
      <div className="mission-layout">
        <div className="mission-copy">
          <p className="eyebrow">Module {mission.order} · {mission.shortTitle}</p>
          <h1>{mission.title}</h1>
          <p className="lead lead--small">{mission.situation}</p>
          <div className="instruction-box"><span>Manipulation physique</span><p>{mission.physicalAction}</p><strong>{mission.instructions[level]}</strong></div>
        </div>
        <div className="mission-console">
          <MissionVisual mission={mission} />
          {success ? (
            <div className="success-box" aria-live="polite">
              <span className="success-box__seal" aria-hidden="true">✓</span>
              <p className="eyebrow">Fragment {mission.order} enregistré</p>
              <h2>Module réparé</h2>
              <div className="fragment-reveal" aria-label={`Fragment découvert : ${mission.answer}`}>{mission.answer}</div>
              <p>{mission.learning}</p>
              {mission.id === 'ai' && <AISimulator done={progress.aiSimulationDone} onDone={() => onProgress({ ...progress, aiSimulationDone: true })} />}
              <button className="button button--primary" onClick={onBack}>Retourner à la carte →</button>
            </div>
          ) : (
            <>
              <form className="fragment-form" onSubmit={submit}>
                <label htmlFor="fragment">Quel chiffre apparaît sur le matériel ?</label>
                <div className="fragment-form__row"><input id="fragment" value={answer} onChange={(event) => setAnswer(event.target.value.replace(/\D/g, '').slice(0, 1))} inputMode="numeric" pattern="[0-9]" autoComplete="off" aria-describedby="mission-feedback" placeholder="?" required /><button className="button button--primary" type="submit">Tester le fragment</button></div>
              </form>
              <div id="mission-feedback" className="feedback" aria-live="polite">{message || 'L’application vérifie le chiffre, mais ne donnera jamais la solution.'}</div>
              <div className="hint-panel">
                <div className="hint-panel__head"><b>Besoin d’un coup de pouce ?</b><button className="button button--hint" onClick={revealHint} disabled={hintCount >= maxHints}>{hintCount >= maxHints ? 'Tous les indices vus' : 'Obtenir un indice'}</button></div>
                {hintCount > 0 && <ol>{mission.hints[level].slice(0, hintCount).map((hint, index) => <li key={hint}><span>Indice {index + 1}</span>{hint}</li>)}</ol>}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Finale({ progress, onBack, onVictory }: { progress: Progress; onBack: () => void; onVictory: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (code === finalCode) onVictory();
    else { setError('Le mécanisme reste immobile. Vérifiez l’ordre des six modules.'); setCode(''); }
  }
  return (
    <section className="finale panel panel--wide">
      <button className="back-link" onClick={onBack}>← Retour à la carte</button>
      <div className="finale__content">
        <p className="eyebrow">Dernière étape</p><h1>Le code de redémarrage</h1>
        <p className="lead lead--small">Placez les fragments dans l’ordre des modules, puis saisissez les six chiffres.</p>
        <div className="fragment-strip">{missions.map((mission) => <div key={mission.id}><small>0{mission.order}</small><span aria-hidden="true">{mission.icon}</span><b>{progress.fragments[mission.id]}</b><em>{mission.shortTitle}</em></div>)}</div>
        <form className="final-form" onSubmit={submit}><label htmlFor="final-code">Les six chiffres</label><input id="final-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" placeholder="••••••" aria-describedby="final-error" required /><button className="button button--primary" type="submit">Relancer la machine ✦</button></form>
        <p id="final-error" className="feedback" aria-live="polite">{error}</p>
      </div>
    </section>
  );
}

function Victory({ onNewTeam }: { onNewTeam: () => void }) {
  return (
    <section className="victory layout-split">
      <div><p className="eyebrow">Mission accomplie</p><h1>Les observations<br /><em>peuvent reprendre !</em></h1><p className="lead">Vous avez réveillé la machine scientifique et retrouvé les six idées qui font fonctionner notre monde numérique.</p>
        <ul className="learning-list">{missions.map((mission) => <li key={mission.id}><span aria-hidden="true">{mission.icon}</span><p><b>{mission.shortTitle}</b>{mission.learning}</p></li>)}</ul>
        <button className="button button--primary button--new-team" onClick={onNewTeam}>Nouvelle équipe</button>
      </div>
      <div className="machine-stage machine-stage--victory"><Machine running /><div className="horizon" /><div className="machine-caption machine-caption--on"><span className="status-dot" /> Observations actives</div></div>
    </section>
  );
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>('welcome');
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const activeMission = useMemo(() => activeMissionId ? getMission(activeMissionId) : undefined, [activeMissionId]);

  useEffect(() => { saveProgress(progress); }, [progress]);

  function chooseLevel(level: Level) { setProgress({ ...progress, level }); setScreen('map'); }
  function openMission(id: string) { setProgress(startMission(progress, id)); setActiveMissionId(id); setScreen('mission'); window.scrollTo(0, 0); }
  function reset() {
    if (!window.confirm('Effacer toute la progression de cette équipe ?')) return;
    clearProgress(); setProgress(initialProgress()); setActiveMissionId(null); setScreen('welcome');
  }
  function newTeam() { clearProgress(); setProgress(initialProgress()); setActiveMissionId(null); setScreen('welcome'); }

  let content: React.ReactNode;
  if (screen === 'welcome') content = <Welcome hasProgress={progress.started.length > 0 || progress.completed.length > 0} onStart={() => setScreen('level')} onResume={() => setScreen(progress.level ? 'map' : 'level')} />;
  else if (screen === 'level') content = <LevelChoice onChoose={chooseLevel} onBack={() => setScreen('welcome')} />;
  else if (screen === 'map') content = <MissionMap progress={progress} onOpen={openMission} onFinale={() => setScreen('finale')} onLevel={() => setScreen('level')} />;
  else if (screen === 'mission' && activeMission?.id === 'components') content = <ComponentMission key={activeMission.id} mission={activeMission} progress={progress} onProgress={setProgress} onBack={() => setScreen('map')} />;
  else if (screen === 'mission' && activeMission?.id === 'program') content = <ProgramMission key={activeMission.id} mission={activeMission} progress={progress} onProgress={setProgress} onBack={() => setScreen('map')} />;
  else if (screen === 'mission' && activeMission?.id === 'memory') content = <MemoryMission key={activeMission.id} mission={activeMission} progress={progress} onProgress={setProgress} onBack={() => setScreen('map')} />;
  else if (screen === 'mission' && activeMission) content = <MissionScreen key={activeMission.id} mission={activeMission} progress={progress} onProgress={setProgress} onBack={() => setScreen('map')} />;
  else if (screen === 'finale') content = <Finale progress={progress} onBack={() => setScreen('map')} onVictory={() => setScreen('victory')} />;
  else content = <Victory onNewTeam={newTeam} />;

  return <Shell progress={progress} screen={screen} onReset={reset}>{content}</Shell>;
}

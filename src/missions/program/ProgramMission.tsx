import { CompletionPanel, MissionHeader, InstructionPanel } from '../../components/Observatory';
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Mission } from '../../data/missions';
import { validateFragment, type Progress } from '../../game/progress';
import { DraggableItem } from '../../game/interactions/DraggableItem';
import { availableIds, executionFeedback, explorerStart, initialRobot, programBlocks, programGrid } from './data';
import { executeProgram, type ExecutionStep, type RobotState } from './engine';

type Props = { mission: Mission; progress: Progress; onProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void };
const blockById = (id: string) => programBlocks.find((block) => block.id === id);
const arrow: Record<RobotState['direction'], string> = { north: '↑', east: '→', south: '↓', west: '←' };

export function ProgramMission({ mission, progress, onProgress, onBack }: Props) {
  const level = progress.level ?? 'scientist';
  const completed = progress.completed.includes(mission.id);
  const firstBlocks = progress.programBlocks.length ? progress.programBlocks : level === 'explorer' ? explorerStart : [];
  const [sequence, setSequence] = useState(firstBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [robot, setRobot] = useState(initialRobot);
  const [visited, setVisited] = useState<string[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState('Construis le programme, puis exécute-le instruction par instruction.');
  const stopRef = useRef(false);

  const persist = (blocks: string[]) => {
    setSequence(blocks);
    onProgress((current) => ({ ...current, programBlocks: blocks }));
  };
  const place = (itemId: string, targetId: string) => {
    if (running || completed) return;
    const index = Number(targetId.replace('program-slot-', ''));
    if (!Number.isInteger(index)) return;
    const without = sequence.filter((id) => id !== itemId);
    without.splice(Math.min(index, without.length), 0, itemId);
    persist(without);
    setSelectedId(null); setDraggingId(null);
  };
  const remove = (id: string) => { if (!running) persist(sequence.filter((item) => item !== id)); };
  const reset = () => {
    stopRef.current = true; setRunning(false); setRobot(initialRobot); setVisited([]); setCurrentBlock(null); setFeedback('Module remis à zéro.');
    persist(level === 'explorer' ? explorerStart : []);
    onProgress((current) => ({ ...current, programBlocks: level === 'explorer' ? explorerStart : [], attempts: { ...current.attempts, program: 0 }, hints: { ...current.hints, program: 0 } }));
  };
  async function run() {
    if (!sequence.length || running) { setFeedback('Ajoute au moins une instruction avant d’exécuter.'); return; }
    if (level === 'expert' && (sequence.length > 4 || !sequence.some((id) => blockById(id)?.instruction.kind === 'repeat'))) {
      setFeedback('Mode Expert : 4 blocs maximum et au moins une instruction Répéter.'); return;
    }
    const instructions = sequence.map(blockById).filter(Boolean).map((block) => block!.instruction);
    const trace = executeProgram(programGrid, initialRobot, instructions);
    stopRef.current = false; setRunning(true); setRobot(initialRobot); setVisited(['4-0']); setFeedback('Exécution en cours : observe l’ordre exact.');
    const delay = import.meta.env.MODE === 'test' ? 0 : window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 900 : 650;
    for (const step of trace) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      if (stopRef.current) { setFeedback('Exécution arrêtée. Tu peux corriger le programme.'); return; }
      setRobot(step.state); setCurrentBlock(step.instructionIndex); setVisited((current) => [...current, `${step.state.row}-${step.state.column}`]);
      if (step.status !== 'running') {
        if (step.status === 'success') {
          setFeedback('Orion s’illumine : le processeur a exécuté le programme exactement.');
          onProgress((current) => validateFragment(current, mission.id, mission.answer).progress);
        } else {
          setFeedback(`${executionFeedback[step.status]}${level === 'expert' ? ` Position (${step.state.row}, ${step.state.column}), orientation ${step.state.direction}.` : ''}`);
          onProgress((current) => validateFragment(current, mission.id, '').progress);
        }
      }
    }
    setRunning(false); setCurrentBlock(null);
  }
  useEffect(() => () => { stopRef.current = true; }, []);
  const reserve = useMemo(() => availableIds[level].filter((id) => !sequence.includes(id)), [level, sequence]);
  const hintCount = progress.hints.program ?? 0;
  const success = completed || progress.fragments.program === '7';

  return <section className="program-mission panel panel--wide">
    <div className="component-mission__topline"><button className="back-link" onClick={onBack}>← Retour au laboratoire</button>{!success && <button className="button button--quiet" onClick={reset}>↺ Réinitialiser ce programme</button>}</div>
    <MissionHeader mission={mission}/><InstructionPanel><p>{level === 'explorer' ? 'Remets les bons blocs dans l’ordre.' : level === 'expert' ? '4 blocs maximum · une boucle obligatoire.' : 'Choisis les instructions utiles dans la réserve.'}</p></InstructionPanel>
    <div className="program-workbench">
      <div className="observatory-grid" role="grid" aria-label="Grille de l’observatoire">
        {Array.from({ length: 25 }, (_, index) => { const row = Math.floor(index / 5); const column = index % 5; const key = `${row}-${column}`; const obstacle = programGrid.obstacles.some(([r,c]) => r===row && c===column); const orion = row===0 && column===4; const celestial = programGrid.celestial.some(([r,c]) => r===row && c===column); const here = robot.row===row && robot.column===column; return <div role="gridcell" key={key} className={`sky-cell ${visited.includes(key) ? 'is-visited' : ''} ${obstacle ? 'is-obstacle' : ''} ${orion ? 'is-orion' : ''}`}><span>{obstacle ? '▰' : orion ? '✦' : celestial ? '· ✦' : ''}</span>{here && <b className="robot" aria-label={`Automate orienté ${robot.direction}`}>{arrow[robot.direction]}</b>}</div>; })}
        <div className={`orion-lines ${success ? 'is-lit' : ''}`} aria-hidden="true">✦━━✦<br /> ┃ 7<br />✦━━✦</div>
      </div>
      <div className="program-console">
        <h2>Programme</h2>
        <div className="program-slots">{Array.from({ length: Math.max(4, sequence.length + 1) }, (_, index) => { const id = sequence[index]; const block = id ? blockById(id) : undefined; return <div key={`${index}-${id ?? 'empty'}`} data-drop-target={`program-slot-${index}`} className={`program-slot ${currentBlock===index ? 'is-current' : ''}`} aria-label={`Position ${index+1}${block ? ` : ${block.label}` : ', vide'}`}>{block ? <><span>{index+1}</span><DraggableItem itemId={id} selected={selectedId===id} dragging={draggingId===id} locked={running} onSelect={(item)=>setSelectedId((current)=>current===item?null:item)} onDragStart={setDraggingId} onDragEnd={()=>setDraggingId(null)} onDrop={place}><b>{block.icon} {block.label}</b></DraggableItem>{!running&&<button className="program-remove" aria-label={`Supprimer ${block.label}`} onClick={()=>remove(id)}>×</button>}</> : <button type="button" className="program-empty" onClick={() => selectedId && place(selectedId, `program-slot-${index}`)} aria-label={`Position ${index+1}, vide`}><em>{selectedId ? 'Déposer ici' : `${index+1}`}</em></button>}</div>; })}</div>
        <div className="program-actions"><button className="button button--primary" disabled={running || success} onClick={run}>▶ Exécuter</button>{running && <button className="button button--secondary" onClick={() => { stopRef.current = true; setRunning(false); }}>■ Arrêter</button>}</div>
      </div>
      <aside className="program-reserve"><h2>Blocs disponibles</h2><div>{reserve.map((id) => { const block = blockById(id)!; return <DraggableItem key={id} itemId={id} selected={selectedId===id} dragging={draggingId===id} locked={running} onSelect={(item) => setSelectedId((current) => current===item ? null : item)} onDragStart={setDraggingId} onDragEnd={() => setDraggingId(null)} onDrop={place}><span className="program-block"><b>{block.icon}</b>{block.label}</span></DraggableItem>; })}</div></aside>
    </div>
    <div className="component-feedback component-feedback--idle" role="status" aria-live="polite"><span>i</span><p>{feedback}</p></div>
    {!success && <div className="component-hints"><button className="button button--hint" onClick={() => onProgress((current) => ({ ...current, hints: { ...current.hints, program: Math.min(mission.hints[level].length, hintCount+1) } }))}>Obtenir un indice</button>{hintCount>0 && <ol>{mission.hints[level].slice(0,hintCount).map((hint,index)=><li key={hint}><b>Indice {index+1}</b>{hint}</li>)}</ol>}</div>}
    {success && <CompletionPanel mission={mission} title="La constellation d’Orion est reliée" onBack={onBack}>{mission.learning}</CompletionPanel>}
  </section>;
}

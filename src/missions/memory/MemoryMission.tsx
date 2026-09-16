import { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { Mission } from '../../data/missions';
import { DraggableItem } from '../../game/interactions/DraggableItem';
import { DropZone } from '../../game/interactions/DropZone';
import { ScreenInputAdapter } from '../../game/interactions/ScreenInputAdapter';
import { usePlacementGame } from '../../game/interactions/usePlacementGame';
import { validateFragment, type Progress } from '../../game/progress';
import { memoryCardsForLevel, memoryFeedback, memoryRulesForLevel } from './data';

type Props = { mission: Mission; progress: Progress; onProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void };
const without = (record: Record<string, number>, key: string) => { const next={...record}; delete next[key]; return next; };

export function MemoryMission({ mission, progress, onProgress, onBack }: Props) {
  const level = progress.level ?? 'scientist';
  const cards = useMemo(() => memoryCardsForLevel(level), [level]);
  const rules = useMemo(() => memoryRulesForLevel(level), [level]);
  const adapter = useMemo(() => new ScreenInputAdapter(), []);
  const completed = progress.completed.includes(mission.id);
  const initialPlacements = useMemo(() => progress.digitalPlacements.memory ?? (completed ? rules : {}), []);
  const game = usePlacementGame({ rules, initialPlacements,
    errorMessage: (itemId) => memoryFeedback(level, cards.find(({id})=>id===itemId)!),
    successMessage: (itemId) => `${cards.find(({id})=>id===itemId)?.title} est correctement classé.`,
    onPlacementChange: (placements) => onProgress((current)=>({...current,digitalPlacements:{...current.digitalPlacements,memory:placements}})),
    onWrongPlacement: () => onProgress((current)=>validateFragment(current,mission.id,'').progress),
    onComplete: () => onProgress((current)=>validateFragment(current,mission.id,mission.answer).progress), inputAdapter: adapter });
  const placed = Object.keys(game.placements).length;
  const hintCount = progress.hints.memory ?? 0;
  const reset = () => { adapter.reset(); onProgress((current)=>({...current,digitalPlacements:{...current.digitalPlacements,memory:{}},attempts:without(current.attempts,'memory'),hints:without(current.hints,'memory')})); };
  return <section className="memory-mission panel panel--wide">
    <div className="component-mission__topline"><button className="back-link" onClick={onBack}>← Retour à la carte</button>{!game.complete && <button className="button button--quiet" onClick={reset}>↺ Réinitialiser le classement</button>}</div>
    <header className="digital-mission-header"><div><p className="eyebrow">Module 3 · Mémoire</p><h1>{mission.title}</h1></div><p aria-label={`${placed}/${cards.length} cartes classées`}><b>{placed}/{cards.length}</b> cartes classées</p></header>
    <div className="memory-room">
      <aside className="memory-reserve"><h2>Réserve d’informations</h2><p>Touche une carte puis une zone, ou fais-la glisser.</p><div>{cards.filter((card)=>!game.placements[card.id]).map((card)=>{const errorNonce=game.error?.itemId===card.id?game.error.nonce:0;return <DraggableItem key={`${card.id}-${errorNonce}`} itemId={card.id} selected={game.selectedId===card.id} dragging={game.draggingId===card.id} locked={false} errorNonce={errorNonce} onSelect={(itemId)=>adapter.emit({type:'select',itemId})} onDragStart={game.startDragging} onDragEnd={game.stopDragging} onDrop={(itemId,targetId)=>adapter.emit({type:'place',itemId,targetId})}><span className="memory-card"><b>{card.icon}</b><span><strong>{card.title}</strong><small>{card.descriptions[level]}</small></span></span></DraggableItem>})}</div></aside>
      <div className="memory-destinations">
        {(['ram','storage'] as const).map((target)=>{const isRam=target==='ram';const placedCards=cards.filter((card)=>game.placements[card.id]===target);return <DropZone key={target} targetId={target} label={isRam?'Table de travail, mémoire vive':'Bibliothèque, stockage'} selectedItemId={game.selectedId??game.draggingId} occupied={false} highlighted={level==='explorer'&&game.error?.itemId?rules[game.error.itemId]===target:false} onPlaceSelected={(targetId)=>game.selectedId&&adapter.emit({type:'place',itemId:game.selectedId,targetId})}><span className={`memory-zone memory-zone--${target}`}><span className="memory-zone__icon">{isRam?'⚡':'▥'}</span><b>{isRam?'Table de travail':'Bibliothèque'}</b><em>{isRam?'Mémoire vive (RAM)':'Stockage'}</em><small>{isRam?'Ce qui est utilisé maintenant et disparaît lorsque la machine s’arrête.':'Ce qui a été enregistré et reste disponible après l’arrêt.'}</small><span className="memory-zone__cards">{placedCards.map((card)=><i key={card.id}>{card.icon}<span>{card.title}</span></i>)}</span></span></DropZone>})}
        <div className={`memory-mechanism memory-mechanism--${placed}`} aria-live="polite"><span className="ram-light">RAM</span><span className="memory-two" aria-label={game.complete?'Fragment découvert : 2':'Fragment encore masqué'}>{game.complete?'2':'?'}</span><span className="shelf-light">STOCKAGE</span></div>
      </div>
    </div>
    <div className={`component-feedback component-feedback--${game.feedback.kind}`} role="status" aria-live="polite"><span>{game.feedback.kind==='error'?'×':game.feedback.kind==='success'?'✓':'i'}</span><p>{game.feedback.message}</p></div>
    {!game.complete&&<div className="component-hints"><button className="button button--hint" onClick={()=>onProgress((current)=>({...current,hints:{...current.hints,memory:Math.min(mission.hints[level].length,hintCount+1)}}))}>Obtenir un indice</button>{hintCount>0&&<ol>{mission.hints[level].slice(0,hintCount).map((hint,index)=><li key={hint}><b>Indice {index+1}</b>{hint}</li>)}</ol>}</div>}
    {game.complete&&<div className="component-success"><span className="component-success__seal">2</span><div><p className="eyebrow">Fragment 3 enregistré automatiquement</p><h2>La bibliothèque révèle son secret</h2><p>{mission.learning}</p></div><button className="button button--primary" onClick={onBack}>Retourner à la carte →</button></div>}
  </section>;
}

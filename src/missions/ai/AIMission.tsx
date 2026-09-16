import { CompletionPanel, MissionHeader, GuideCharacter } from '../../components/Observatory';
import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Level, Mission } from '../../data/missions';
import { ambiguousObservation, balancedTraining, biasedTraining, classifyDetailed, clearObservation, newObservations, type ClassificationResult, type Observation, type ObservationClass } from '../../game/classifier';
import { DraggableItem } from '../../game/interactions/DraggableItem';
import { DropZone } from '../../game/interactions/DropZone';
import { usePlacementGame } from '../../game/interactions/usePlacementGame';
import { initialAIMission, validateFragment, type Progress } from '../../game/progress';
import { describeKnownExample, readableAmount, stepCopy, type GuidedStep } from './copy';
import { SkyPlot } from './SkyPlot';

type Props = { mission: Mission; progress: Progress; onProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void };
const without = (record: Record<string, number>, key: string) => { const next = { ...record }; delete next[key]; return next; };
const firstExamples = [balancedTraining[0], balancedTraining[2]];

function FamilyName({ label }: { label: ObservationClass }) {
  return <>{label === 'signal' ? '★ Signal intéressant' : '◆ Parasite'}</>;
}

function TraitBars({ item, level }: { item: Observation; level: Level }) {
  return <div className="ai-traits"><div><span>Luminosité</span><i><b style={{ width: `${item.brightness * 10}%` }} /></i><strong>{level === 'explorer' ? readableAmount(item.brightness) : `${item.brightness}/10`}</strong></div><div><span>Régularité</span><i><b style={{ width: `${item.regularity * 10}%` }} /></i><strong>{level === 'explorer' ? readableAmount(item.regularity) : `${item.regularity}/10`}</strong></div></div>;
}

function NeighborSummary({ result, level, detailed = false }: { result: ClassificationResult; level: Level; detailed?: boolean }) {
  return <div className="ai-guided-vote"><div className="ai-vote-icons" aria-label={`${result.votes.signal} signaux et ${result.votes.parasite} parasites parmi les trois exemples les plus proches`}>{result.neighbors.map(({ observation }) => <span key={observation.id} title={observation.name}>{observation.label === 'signal' ? '★' : '◆'}</span>)}</div><p>{result.votes.signal} signal{result.votes.signal > 1 ? 's' : ''} · {result.votes.parasite} parasite{result.votes.parasite > 1 ? 's' : ''}</p>{detailed && level !== 'explorer' && <details className="ai-curious"><summary>Voir comment la distance est calculée</summary><p>On compare la luminosité et la régularité. Plus les deux nombres sont proches, plus la distance est petite.</p><ul>{result.neighbors.map(({ observation, distance }) => <li key={observation.id}>{observation.name} : distance {distance.toFixed(2)}</li>)}</ul>{level === 'expert' && <p>Cette simulation utilise k = 3. En cas d’égalité de votes, la règle choisit « parasite »{result.tieApplied ? ' : elle vient d’être appliquée.' : ' ; ici, elle n’a pas été nécessaire.'}</p>}</details>}</div>;
}

export function AIMission({ mission, progress, onProgress, onBack }: Props) {
  const level = progress.level ?? 'scientist';
  const state = progress.aiMission;
  const complete = progress.completed.includes('ai');
  const step: GuidedStep = complete ? 4 : state.phase;
  const guide = stepCopy[level][step];
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const demo = classifyDetailed(clearObservation, balancedTraining);
  const balanced = classifyDetailed(ambiguousObservation, balancedTraining);
  const biased = classifyDetailed(ambiguousObservation, biasedTraining);
  const rules = Object.fromEntries(newObservations.map((item, index) => {
    const learned = newObservations.slice(0, index).filter((previous) => state.placements[previous.id])
      .map((previous) => ({ ...previous, label: state.placements[previous.id] }));
    return [item.id, classifyDetailed(item, [...balancedTraining, ...learned]).predictedClass];
  }));

  const game = usePlacementGame({
    rules,
    initialPlacements: state.placements,
    errorMessage: (id) => { const item = newObservations.find((entry) => entry.id === id)!; return `${item.name} n’est pas dans cette famille. Regarde sa luminosité et son rythme : à quel groupe ressemble-t-elle le plus ?`; },
    successMessage: (id) => `${id.toUpperCase()} est bien rangée. Cet exemple rejoint la mémoire d’apprentissage de l’IA.`,
    onPlacementChange: (placements) => onProgress((current) => {
      const added = Object.keys(placements).find((id) => !current.aiMission.placements[id]);
      return { ...current, aiMission: { ...current.aiMission, placements: placements as Progress['aiMission']['placements'], reviewItemId: added ?? current.aiMission.reviewItemId } };
    }),
    onWrongPlacement: () => onProgress((current) => validateFragment(current, 'ai', '').progress),
  });

  const updateAI = (patch: Partial<Progress['aiMission']>) => onProgress((current) => ({ ...current, aiMission: { ...current.aiMission, ...patch } }));
  const consult = (id: string) => { setSelectedExample(id); setNotice('Exemple observé : sa famille et ses deux caractéristiques sont affichées.'); onProgress((current) => ({ ...current, aiMission: { ...current.aiMission, consulted: [...new Set([...current.aiMission.consulted, id])] } })); };
  const helpCount = state.helpCounts[step - 1] ?? 0;
  const getHelp = () => {
    setShowHelp(true);
    onProgress((current) => { const counts = [...current.aiMission.helpCounts] as Progress['aiMission']['helpCounts']; counts[step - 1] = Math.min(3, counts[step - 1] + 1); return { ...current, hints: { ...current.hints, ai: (current.hints.ai ?? 0) + 1 }, aiMission: { ...current.aiMission, helpCounts: counts } }; });
  };
  const reset = () => { game.reset(); setSelectedExample(null); setNotice('La mission IA recommence à la première étape.'); setShowHelp(false); onProgress((current) => ({ ...current, aiMission: initialAIMission(), hints: without(current.hints, 'ai'), attempts: without(current.attempts, 'ai') })); };
  const finish = () => onProgress((current) => current.aiMission.phase === 4 && current.aiMission.comparisonStep === 4 && current.aiMission.biasedDone ? validateFragment(current, 'ai', mission.answer).progress : current);

  const currentIndex = newObservations.findIndex((item) => !game.placements[item.id]);
  const focusedExample = firstExamples.find((item) => item.id === selectedExample);
  const current = currentIndex >= 0 ? newObservations[currentIndex] : undefined;
  const review = newObservations.find((item) => item.id === state.reviewItemId);
  const priorTraining: Observation[] = [...balancedTraining, ...newObservations.filter((item) => game.placements[item.id] && item.id !== review?.id).map((item) => ({ ...item, label: rules[item.id] as ObservationClass }))];
  const visibleTraining: Observation[] = [...priorTraining, ...(review ? [{ ...review, label: rules[review.id] as ObservationClass }] : [])];
  const activeResult = classifyDetailed(review ?? current ?? clearObservation, priorTraining);
  const taskInstruction = step === 2 && state.demoStep === 6 ? 'Choisis ce que l’IA a utilisé pour proposer sa réponse.'
    : step === 3 && review ? 'Regarde comment cet exemple rejoint la mémoire, puis passe au suivant.'
      : step === 4 && state.comparisonStep === 1 ? 'Teste la lueur inconnue avec l’IA bien entraînée.'
        : step === 4 && state.comparisonStep === 2 ? 'Teste la même lueur avec l’IA mal entraînée.'
          : step === 4 && state.comparisonStep === 3 ? 'Observe la réponse de l’IA mal entraînée.'
            : step === 4 && state.comparisonStep === 4 ? 'Compare les deux réponses, puis conclus la mission.' : guide.instruction;

  return <section className={`ai-mission ai-guided ${step === 4 && (state.comparisonStep === 2 || state.comparisonStep === 3) ? 'ai-guided--comparison-result' : ''} panel panel--wide`}>
    <div className="component-mission__topline"><button className="back-link" onClick={onBack}>← Retour au laboratoire</button>{!complete && <div className="ai-top-actions"><div className="ai-context-help"><button className="button button--hint" onClick={getHelp}>Besoin d’aide ?</button>{showHelp && helpCount > 0 && <div role="status"><b>Coup de pouce {helpCount}/3</b><p>{guide.help[Math.min(helpCount, 3) - 1]}</p><button className="ai-help-close" onClick={() => setShowHelp(false)}>Fermer l’aide</button></div>}</div><button className="button button--quiet" onClick={reset}>↺ Réinitialiser la mission IA</button></div>}</div>
    <div className="ai-guided-header"><MissionHeader mission={{ ...mission, title: "Apprendre à la machine à observer le ciel" }}/><div className="ai-step-indicator" aria-label={`Étape ${step} sur 4`}>{([1, 2, 3, 4] as const).map((number) => <span key={number} className={number === step ? 'is-current' : number < step ? 'is-done' : ''}>{number === step ? `Étape ${number} sur 4 — ${stepCopy[level][number].title}` : `${number < step ? '✓' : number} ${stepCopy[level][number].title}`}</span>)}</div></div>
    {!complete && <><div className="ai-guide"><GuideCharacter mood={game.feedback.kind === 'error' ? 'error' : 'explain'}/><div><strong>Le guide de l’observatoire</strong><h2>{guide.title}</h2><p>{guide.guide}</p></div></div><div className="ai-task"><b>À toi de jouer</b><p>{taskInstruction}</p></div></>}

    {!complete && step === 1 && <div className="ai-step-content">
      <div className="ai-family-grid">{firstExamples.map((item) => <button key={item.id} className={`ai-family-card ${state.consulted.includes(item.id) ? 'is-seen' : ''}`} onClick={() => consult(item.id)} aria-pressed={selectedExample === item.id}><span className="ai-family-symbol" aria-hidden="true">{item.label === 'signal' ? '★' : '◆'}</span><b><FamilyName label={item.label!} /></b><TraitBars item={item} level={level} /><small>{state.consulted.includes(item.id) ? '✓ Exemple observé' : 'Toucher pour observer'}</small></button>)}</div>
      {focusedExample && <div className="ai-response" role="status" aria-label="Exemple sélectionné" aria-live="polite" key={focusedExample.id}><b>{focusedExample.name} · <FamilyName label={focusedExample.label!} /></b><p>{describeKnownExample(focusedExample, level)}</p></div>}
      {level === 'expert' && <details className="ai-curious"><summary>Pour les curieux · Que sont les caractéristiques ?</summary><p>Ce sont les deux nombres qui décrivent chaque observation. Ici, ils forment le couple (luminosité, régularité).</p></details>}
      <div className="ai-primary-row"><p>{firstExamples.filter((item) => state.consulted.includes(item.id)).length}/2 exemples observés</p><button className="button button--primary" disabled={!firstExamples.every((item) => state.consulted.includes(item.id))} onClick={() => { updateAI({ phase: 2 }); setNotice('Tu as vu les deux familles. Regardons maintenant comment la machine compare.'); }}>J’ai compris les exemples →</button></div>
    </div>}

    {!complete && step === 2 && <div className="ai-step-content"><div className="ai-demo-layout"><div className="ai-demo-stage">{state.demoStep === 0 ? <div className="ai-unknown-intro"><span aria-hidden="true">◎</span><h3>Écho régulier</h3><TraitBars item={clearObservation} level={level} /><p>Sa famille est encore inconnue.</p></div> : <SkyPlot training={state.demoStep >= 2 ? balancedTraining : []} selected={clearObservation} result={demo} showLines={state.demoStep >= 3} showNeighbors={state.demoStep >= 3} />}</div><div className="ai-demo-caption" role="status" aria-live="polite"><p>{['Voici une nouvelle lumière. L’IA ne connaît pas encore sa famille.', 'Le nouveau point apparaît sur la carte du ciel.', 'La machine fait apparaître ses exemples connus.', 'Elle relie la lumière aux trois exemples les plus proches.', 'Les voisins retenus votent pour leur famille.', 'La majorité propose : signal intéressant.', 'À toi de vérifier ce que la machine a utilisé.'][state.demoStep]}</p>{state.demoStep === 4 && <NeighborSummary result={demo} level={level} />}{state.demoStep === 5 && <div className="ai-prediction">★ Prédiction : signal intéressant<small>Une prédiction n’est pas une certitude.</small></div>}{state.demoStep < 6 && <button className="button button--primary" onClick={() => updateAI({ demoStep: state.demoStep + 1 })}>{state.demoStep === 0 ? 'Voir la comparaison' : 'Continuer →'}</button>}{state.demoStep === 6 && <><h3>Sur quoi l’IA s’est-elle appuyée ?</h3><div className="ai-answer-grid">{['Sur les exemples les plus proches', 'Sur une réponse choisie au hasard', 'Sur ce que pense l’enfant'].map((answer, index) => <button key={answer} disabled={state.demoAnswerCorrect} onClick={() => { if (index === 0) { updateAI({ demoAnswerCorrect: true }); setNotice('Oui ! Elle compare avec les exemples les plus proches.'); } else setNotice('Essaie encore : la machine ne devine pas et ne lit pas dans les pensées. Regarde les exemples entourés.'); }}>{answer}</button>)}</div><p className="ai-feedback" role="status">{state.demoAnswerCorrect ? 'Oui ! Elle compare avec les exemples les plus proches.' : notice}</p>{state.demoAnswerCorrect && <button className="button button--primary" onClick={() => { updateAI({ phase: 3 }); setNotice('À toi de classer une observation à la fois.'); }}>Je peux entraîner la machine →</button>}</>}{state.demoStep >= 3 && level !== 'explorer' && <details className="ai-curious"><summary>Voir comment la distance est calculée</summary><p>Le programme compare les deux nombres de chaque observation. Plus les écarts sont petits, plus les observations sont proches.</p><ul>{demo.neighbors.map(({ observation, distance }) => <li key={observation.id}>{observation.name} : distance {distance.toFixed(2)}</li>)}</ul>{level === 'expert' && <p>Distance = √((écart de luminosité)² + (écart de régularité)²). Le classifieur retient k = 3 voisins. Une égalité de votes est résolue en faveur de « parasite ».</p>}</details>}</div></div></div>}

    {!complete && step === 3 && <div className="ai-step-content"><div className="ai-training-count">Observation {Math.min(Object.keys(game.placements).length + (review ? 0 : 1), 4)} sur 4</div>{review ? <div className="ai-review"><div className="ai-review-symbol" aria-hidden="true">{rules[review.id] === 'signal' ? '★' : '◆'}</div><div><h3>{review.name} rejoint les exemples connus</h3><p>Cet exemple rejoint la mémoire d’apprentissage de l’IA. Elle pourra maintenant le comparer aux prochaines lumières.</p><TraitBars item={review} level={level} /><p><FamilyName label={rules[review.id] as ObservationClass} /></p><button className="button button--primary" onClick={() => { updateAI({ reviewItemId: null, phase: game.complete ? 4 : 3 }); setNotice(game.complete ? 'Les quatre observations sont classées. Vérifions maintenant si les exemples influencent les réponses.' : 'Observe maintenant la lumière suivante.'); }}>{game.complete ? 'Découvrir si l’IA peut se tromper →' : 'Voir l’observation suivante →'}</button></div></div> : current ? <div className="ai-training-layout"><div className="ai-training-card"><h3>Observation {current.name.toUpperCase()}</h3><DraggableItem key={`${current.id}-${game.error?.itemId === current.id ? game.error.nonce : 0}`} itemId={current.id} selected={game.selectedId === current.id} dragging={game.draggingId === current.id} locked={false} errorNonce={game.error?.itemId === current.id ? game.error.nonce : 0} onSelect={game.selectItem} onDragStart={game.startDragging} onDragEnd={game.stopDragging} onDrop={game.tryPlace}><span className="ai-card"><b>◎ {current.name}</b><TraitBars item={current} level={level} /></span></DraggableItem><p>Sélectionne cette carte puis touche une famille, ou glisse la carte directement dessus.</p><div className="ai-zones">{(['signal', 'parasite'] as const).map((target) => <DropZone key={target} targetId={target} label={`Famille ${target}`} selectedItemId={game.selectedId ?? game.draggingId} occupied={false} onPlaceSelected={() => game.placeSelected(target)}><b><FamilyName label={target} /></b><small>Toucher pour déposer</small></DropZone>)}</div><div className="ai-feedback" role="status" aria-live="polite">{game.feedback.kind === 'error' ? game.feedback.message : game.selectedId ? 'Carte sélectionnée. Choisis maintenant sa famille.' : 'Observe les deux barres avant de choisir.'}</div></div><div className="ai-training-plot"><SkyPlot training={visibleTraining} selected={current} result={activeResult} showLines={game.selectedId === current.id} showNeighbors={game.selectedId === current.id} /><p>Chaque exemple correctement rangé s’ajoute à cette carte du ciel.</p>{level !== 'explorer' && <details className="ai-curious"><summary>Pour les curieux · Voir les voisins</summary><NeighborSummary result={activeResult} level={level} detailed /></details>}</div></div> : null}</div>}

    {!complete && step === 4 && <div className="ai-step-content">
      {state.comparisonStep === 0 && <><div className="ai-machine-grid"><div className="ai-machine-card"><h3>IA bien entraînée</h3><p>★ ★ · ◆ ◆</p><small>2 signaux, 2 parasites</small></div><div className="ai-machine-card"><h3>IA mal entraînée</h3><p>★ · ◆ ◆ ◆ ◆</p><small>1 signal, 4 parasites</small></div></div><div className="ai-comparison-panel"><h3>Laquelle a les exemples les plus équilibrés ?</h3><div className="ai-answer-grid"><button onClick={() => { updateAI({ comparisonStep: 1 }); setNotice('Oui : deux exemples de chaque famille. Les deux IA utilisent pourtant la même méthode.'); }}>IA bien entraînée</button><button onClick={() => setNotice('Regarde les nombres : l’autre machine a deux exemples dans chaque famille. Essaie encore.')}>IA mal entraînée</button></div><p className="ai-feedback" role="status">{notice}</p></div></>}
      {state.comparisonStep >= 1 && <div className="ai-comparison-panel">
        <p className="ai-shared-observation">Même observation pour les deux machines : <b>Lueur inconnue ◎</b>{level === 'explorer' ? ' · lumière forte, rythme régulier' : ' · luminosité 8, régularité 7'}. L’astronome a vérifié : c’est un vrai signal.</p>
        {state.comparisonStep === 1 && <button className="button button--primary" onClick={() => updateAI({ comparisonStep: 2, balancedDone: true })}>Tester l’IA bien entraînée →</button>}
        {state.comparisonStep === 2 && <><div className="ai-comparison-result"><h3>IA bien entraînée</h3><SkyPlot training={balancedTraining} selected={ambiguousObservation} result={balanced} showLines showNeighbors /><NeighborSummary result={balanced} level={level} /><p>Elle propose : <b>★ Signal intéressant</b>. C’est la bonne réponse pour cette observation.</p></div><button className="button button--primary" onClick={() => updateAI({ comparisonStep: 3, biasedDone: true })}>Tester l’IA mal entraînée →</button></>}
        {state.comparisonStep === 3 && <><div className="ai-comparison-result"><h3>IA mal entraînée</h3><SkyPlot training={biasedTraining} selected={ambiguousObservation} result={biased} showLines showNeighbors /><NeighborSummary result={biased} level={level} /><strong>Propose : parasite ✕</strong></div><button className="button button--primary" onClick={() => updateAI({ comparisonStep: 4 })}>Comparer les deux réponses →</button></>}
        {state.comparisonStep === 4 && <><div className="ai-comparison-results"><div className="ai-comparison-result ai-comparison-result--compact"><h3>IA bien entraînée</h3><p>★ 2 voix · ◆ 1 voix</p><strong>Propose : signal ✓</strong></div><div className="ai-comparison-result ai-comparison-result--compact"><h3>IA mal entraînée</h3><p>★ 1 voix · ◆ 2 voix</p><strong>Propose : parasite ✕</strong></div></div><p className="ai-warning">La méthode n’a pas changé. Ce sont les exemples donnés à l’IA qui ont changé son résultat. Ici, cette prédiction est fausse : l’IA peut se tromper sans être cassée.</p><p className="ai-guide-conclusion">Pour bien utiliser une IA, il faut vérifier ses données et garder un regard humain.</p>{level === 'expert' && <details className="ai-curious"><summary>Pour les curieux · Qu’est-ce qu’un biais ?</summary><p>Un biais est une tendance systématique liée, entre autres, aux données choisies. Cet exemple simplifié montre un déséquilibre de classes ; toutes les IA ne se comportent pas ainsi.</p></details>}<button className="button button--primary" onClick={finish}>J’ai compris : révéler le fragment →</button></>}
      </div>}
    </div>}

    {complete && <CompletionPanel mission={mission} title="Les observations révèlent le 6" onBack={onBack}><p>O1 et O2 : signal. O3 et O4 : parasite.</p><p>Ici, nous simulons une petite IA. Les vraies IA peuvent utiliser beaucoup plus d’exemples et de calculs, mais le principe reste le même : apprendre à partir de données.</p><p>Une IA peut se tromper. Pour bien l’utiliser, il faut vérifier ses données et garder un regard humain.</p></CompletionPanel>}

  </section>;
}

import { CompletionPanel, MissionHeader, InstructionPanel } from '../../components/Observatory';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { Level, Mission } from '../../data/missions';
import { validateFragment, type Progress } from '../../game/progress';
import { DraggableItem } from '../../game/interactions/DraggableItem';
import { DropZone } from '../../game/interactions/DropZone';
import { ScreenInputAdapter } from '../../game/interactions/ScreenInputAdapter';
import { usePlacementGame } from '../../game/interactions/usePlacementGame';
import {
  allComponentPlacements,
  componentDefinitions,
  componentInstructions,
  componentRules,
  componentTargets,
  placementError,
  type ComponentDefinition,
} from './data';

type Props = {
  mission: Mission;
  progress: Progress;
  onProgress: Dispatch<SetStateAction<Progress>>;
  onBack: () => void;
};

function ComponentIcon({ visual }: { visual: ComponentDefinition['visual'] }) {
  return <span className={`component-icon component-icon--${visual}`} aria-hidden="true"><i /><i /><i /></span>;
}

function ComponentCard({ item, level, installed = false }: { item: ComponentDefinition; level: Level; installed?: boolean }) {
  const matchMarker = componentTargets.find(({ id }) => id === item.targetId)?.marker;
  return (
    <span className={`component-card-content ${installed ? 'component-card-content--installed' : ''}`}>
      <ComponentIcon visual={item.visual} />
      <span className="component-card-content__copy"><b>{item.name}</b>{!installed && <small>{item.roles[level]}</small>}</span>
      {!installed && level === 'explorer' && <span className="component-card-content__marker" aria-label={`Repère visuel ${matchMarker}`}>{matchMarker}</span>}
    </span>
  );
}

function deleteRecordKey(record: Record<string, number>, key: string) {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

export function ComponentMission({ mission, progress, onProgress, onBack }: Props) {
  const level = progress.level ?? 'scientist';
  const alreadyCompleted = progress.completed.includes(mission.id);
  const initialPlacements = useMemo(
    () => progress.digitalPlacements.components ?? (alreadyCompleted ? allComponentPlacements : {}),
    // The hook consumes this value only during its initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const screenInput = useMemo(() => new ScreenInputAdapter(), []);

  const game = usePlacementGame({
    rules: componentRules,
    initialPlacements,
    errorMessage: (itemId, targetId) => placementError(level, itemId, targetId),
    successMessage: (itemId) => componentDefinitions.find(({ id }) => id === itemId)?.installedFeedback[level] ?? 'Pièce installée.',
    onPlacementChange: (placements) => onProgress((current) => ({
      ...current,
      digitalPlacements: { ...current.digitalPlacements, components: placements },
    })),
    onWrongPlacement: () => onProgress((current) => validateFragment(current, mission.id, '').progress),
    onComplete: () => onProgress((current) => validateFragment(current, mission.id, mission.answer).progress),
    inputAdapter: screenInput,
  });

  const installedCount = Object.keys(game.placements).length;
  const hintCount = progress.hints[mission.id] ?? 0;
  const hints = mission.hints[level];

  function revealHint() {
    if (hintCount >= hints.length) return;
    onProgress((current) => ({ ...current, hints: { ...current.hints, [mission.id]: hintCount + 1 } }));
  }

  function resetMission() {
    screenInput.reset();
    onProgress((current) => ({
      ...current,
      digitalPlacements: { ...current.digitalPlacements, components: {} },
      attempts: deleteRecordKey(current.attempts, mission.id),
      hints: deleteRecordKey(current.hints, mission.id),
    }));
  }

  return (
    <section className="component-mission panel panel--wide">
      <div className="component-mission__topline">
        <button className="back-link" onClick={onBack}>← Retour au laboratoire</button>
        {!game.complete && <button className="button button--quiet component-reset" onClick={resetMission}>↺ Remettre ce module à zéro</button>}
      </div>

      <MissionHeader mission={mission}><div className="component-progress" aria-label={`${installedCount} ${installedCount === 1 ? 'composant installé' : 'composants installés'} sur 4`}><b>{installedCount} <span>sur 4</span></b><small>composants installés</small></div></MissionHeader>
      <InstructionPanel mood={game.feedback.kind === 'error' ? 'error' : game.complete ? 'success' : 'explain'}><p>{componentInstructions[level]}</p></InstructionPanel>

      <div className={`component-game ${game.complete ? 'component-game--complete' : ''}`}>
        <aside className="component-reserve" aria-label="Réserve de composants">
          <div className="component-reserve__heading"><span>1</span><div><b>Choisis une pièce</b><small>Touche ou fais glisser</small></div></div>
          <div className="component-reserve__items">
            {componentDefinitions.map((item) => {
              const installed = Boolean(game.placements[item.id]);
              if (installed) return null;
              const errorNonce = game.error?.itemId === item.id ? game.error.nonce : 0;
              return (
                <DraggableItem
                  key={`${item.id}-${errorNonce}`}
                  itemId={item.id}
                  selected={game.selectedId === item.id}
                  dragging={game.draggingId === item.id}
                  locked={false}
                  errorNonce={errorNonce}
                  onSelect={(itemId) => screenInput.emit({ type: 'select', itemId })}
                  onDragStart={game.startDragging}
                  onDragEnd={game.stopDragging}
                  onDrop={(itemId, targetId) => screenInput.emit({ type: 'place', itemId, targetId })}
                >
                  <ComponentCard item={item} level={level} />
                </DraggableItem>
              );
            })}
            {installedCount === 4 && <p className="reserve-empty">Toutes les pièces alimentent la machine.</p>}
          </div>
        </aside>

        <div className={`component-machine component-machine--energized-${installedCount}`} aria-label="Cœur de la machine scientifique">
          <div className="component-machine__stars" aria-hidden="true">✦ · ✧ · ✦</div>
          <div className="component-machine__title"><span>2</span><div><b>Installe dans la machine</b><small>Lis le besoin de chaque emplacement</small></div></div>
          <div className="machine-circuits" aria-hidden="true"><i /><i /><i /><i /><b /></div>
          <div className="component-targets">
            {componentTargets.map((target) => {
              const installedItemId = Object.entries(game.placements).find(([, targetId]) => targetId === target.id)?.[0];
              const installedItem = componentDefinitions.find(({ id }) => id === installedItemId);
              const explorerMatch = level === 'explorer' && game.selectedId ? componentRules[game.selectedId] === target.id : false;
              return (
                <DropZone
                  key={target.id}
                  targetId={target.id}
                  label={target.needs[level]}
                  selectedItemId={game.selectedId ?? game.draggingId}
                  occupied={Boolean(installedItem)}
                  highlighted={explorerMatch}
                  onPlaceSelected={(targetId) => {
                    if (game.selectedId) screenInput.emit({ type: 'place', itemId: game.selectedId, targetId });
                  }}
                >
                  <span className="drop-zone__marker" aria-hidden="true">{target.marker}</span>
                  {installedItem ? <ComponentCard item={installedItem} level={level} installed /> : <>
                    <span className="drop-zone__need">{target.needs[level]}</span>
                    <span className="drop-zone__action">{game.selectedId ? 'Déposer ici' : 'Emplacement vide'}</span>
                  </>}
                </DropZone>
              );
            })}
          </div>

          <div className={`digital-fragment ${game.complete ? 'digital-fragment--visible' : ''}`} aria-live="polite">
            <span className="digital-fragment__label">Circuits convergents</span>
            <b aria-label={game.complete ? 'Fragment découvert : 4' : 'Fragment encore masqué'}>{game.complete ? '4' : '·'}</b>
          </div>
        </div>
      </div>

      <div className={`component-feedback component-feedback--${game.feedback.kind}`} role="status" aria-live="polite">
        <span aria-hidden="true">{game.feedback.kind === 'error' ? '×' : game.feedback.kind === 'success' ? '✓' : 'i'}</span>
        <p>{game.feedback.message}</p>
      </div>

      {!game.complete && (
        <div className="component-hints">
          <button className="button button--hint" onClick={revealHint} disabled={hintCount >= hints.length}>{hintCount >= hints.length ? 'Tous les indices vus' : 'Obtenir un indice'}</button>
          {hintCount > 0 && <ol>{hints.slice(0, hintCount).map((hint, index) => <li key={hint}><b>Indice {index + 1}</b>{hint}</li>)}</ol>}
        </div>
      )}

      {game.complete && <CompletionPanel mission={mission} title="Le cœur de la machine bat à nouveau" onBack={onBack}/>}

    </section>
  );
}

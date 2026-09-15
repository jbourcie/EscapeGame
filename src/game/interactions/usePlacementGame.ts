import { useCallback, useEffect, useState } from 'react';
import { attemptPlacement, isPlacementComplete, type PlacementRules } from './placementEngine';
import type { MissionInputAdapter, PlacementFeedback, PlacementMap } from './types';

type Options = {
  rules: PlacementRules;
  initialPlacements?: PlacementMap;
  errorMessage: (itemId: string, targetId: string) => string;
  successMessage: (itemId: string) => string;
  onPlacementChange?: (placements: PlacementMap) => void;
  onWrongPlacement?: (itemId: string, targetId: string) => void;
  onComplete?: () => void;
  inputAdapter?: MissionInputAdapter;
};

export function usePlacementGame({ rules, initialPlacements = {}, errorMessage, successMessage, onPlacementChange, onWrongPlacement, onComplete, inputAdapter }: Options) {
  const [placements, setPlacements] = useState<PlacementMap>(initialPlacements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<{ itemId: string; targetId: string; nonce: number } | null>(null);
  const [feedback, setFeedback] = useState<PlacementFeedback>({ kind: 'idle', message: 'Choisis une pièce, puis sa destination.' });

  const selectItem = useCallback((itemId: string) => {
    if (placements[itemId]) return;
    setSelectedId((current) => current === itemId ? null : itemId);
    setFeedback({ kind: 'idle', message: selectedId === itemId ? 'Sélection annulée.' : 'Pièce sélectionnée. Choisis maintenant une destination.' });
  }, [placements, selectedId]);

  const tryPlace = useCallback((itemId: string, targetId: string) => {
    const result = attemptPlacement(rules, placements, itemId, targetId);
    setDraggingId(null);
    setSelectedId(null);
    if (!result.accepted) {
      if (result.reason === 'wrong-target') {
        setError((current) => ({ itemId, targetId, nonce: (current?.nonce ?? 0) + 1 }));
        setFeedback({ kind: 'error', message: errorMessage(itemId, targetId) });
        onWrongPlacement?.(itemId, targetId);
      }
      return false;
    }
    setError(null);
    setPlacements(result.placements);
    setFeedback({ kind: 'success', message: successMessage(itemId) });
    onPlacementChange?.(result.placements);
    if (result.complete) onComplete?.();
    return true;
  }, [errorMessage, onComplete, onPlacementChange, onWrongPlacement, placements, rules, successMessage]);

  const placeSelected = useCallback((targetId: string) => {
    if (!selectedId) return false;
    return tryPlace(selectedId, targetId);
  }, [selectedId, tryPlace]);

  const reset = useCallback(() => {
    setPlacements({});
    setSelectedId(null);
    setDraggingId(null);
    setError(null);
    setFeedback({ kind: 'idle', message: 'Mission remise à zéro. Choisis une pièce.' });
    onPlacementChange?.({});
  }, [onPlacementChange]);

  useEffect(() => inputAdapter?.subscribe((event) => {
    if (event.type === 'select') selectItem(event.itemId);
    if (event.type === 'place') tryPlace(event.itemId, event.targetId);
    if (event.type === 'reset') reset();
  }), [inputAdapter, reset, selectItem, tryPlace]);

  return {
    placements,
    selectedId,
    draggingId,
    error,
    feedback,
    complete: isPlacementComplete(rules, placements),
    selectItem,
    tryPlace,
    placeSelected,
    startDragging: setDraggingId,
    stopDragging: () => setDraggingId(null),
    reset,
  };
}

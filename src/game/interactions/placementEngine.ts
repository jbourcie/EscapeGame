import type { PlacementMap } from './types';

export type PlacementRules = Record<string, string>;

export type PlacementResult = {
  accepted: boolean;
  complete: boolean;
  placements: PlacementMap;
  reason?: 'unknown-item' | 'locked' | 'wrong-target';
};

export function isPlacementComplete(rules: PlacementRules, placements: PlacementMap) {
  return Object.entries(rules).every(([itemId, targetId]) => placements[itemId] === targetId);
}

export function attemptPlacement(rules: PlacementRules, placements: PlacementMap, itemId: string, targetId: string): PlacementResult {
  if (!(itemId in rules)) return { accepted: false, complete: false, placements, reason: 'unknown-item' };
  if (placements[itemId]) return { accepted: false, complete: isPlacementComplete(rules, placements), placements, reason: 'locked' };
  if (rules[itemId] !== targetId) return { accepted: false, complete: false, placements, reason: 'wrong-target' };

  const updated = { ...placements, [itemId]: targetId };
  return { accepted: true, complete: isPlacementComplete(rules, updated), placements: updated };
}

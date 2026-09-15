import { describe, expect, it } from 'vitest';
import { allComponentPlacements, componentRules } from '../../missions/components/data';
import { attemptPlacement, isPlacementComplete } from './placementEngine';

describe('moteur de placement réutilisable', () => {
  it('accepte un placement correct et le verrouille dans l’état', () => {
    const result = attemptPlacement(componentRules, {}, 'processor', 'compute');
    expect(result.accepted).toBe(true);
    expect(result.placements.processor).toBe('compute');

    const secondAttempt = attemptPlacement(componentRules, result.placements, 'processor', 'persistent');
    expect(secondAttempt.accepted).toBe(false);
    expect(secondAttempt.reason).toBe('locked');
    expect(secondAttempt.placements.processor).toBe('compute');
  });

  it('refuse un mauvais placement sans modifier les positions', () => {
    const result = attemptPlacement(componentRules, {}, 'ram', 'energy');
    expect(result).toMatchObject({ accepted: false, reason: 'wrong-target', placements: {} });
  });

  it('déclare la réussite seulement après les quatre placements', () => {
    const incomplete = { processor: 'compute', ram: 'temporary', storage: 'persistent' };
    expect(isPlacementComplete(componentRules, incomplete)).toBe(false);
    expect(isPlacementComplete(componentRules, allComponentPlacements)).toBe(true);
  });
});

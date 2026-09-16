import { describe, expect, it } from 'vitest';
import { ambiguousObservation, balancedTraining, biasedTraining, classify, classifyDetailed, clearObservation, distanceBetween, newObservations } from './classifier';

describe('classification pédagogique locale', () => {
  it('classe de façon déterministe un cas clair', () => {
    expect(classify(clearObservation, balancedTraining)).toBe('signal');
    expect(classify(clearObservation, balancedTraining)).toBe('signal');
  });

  it('illustre l’effet d’un apprentissage déséquilibré', () => {
    expect(classify(ambiguousObservation, biasedTraining)).toBe('parasite');
  });

  it('refuse un jeu d’apprentissage vide', () => {
    expect(() => classify(clearObservation, [])).toThrow();
    expect(() => classify(clearObservation, [{ ...clearObservation }])).toThrow();
  });

  it('calcule les distances, borne k et conserve les voisins sans muter les données', () => {
    const snapshot = JSON.stringify(balancedTraining);
    expect(distanceBetween(clearObservation, balancedTraining[0])).toBe(1);
    const result = classifyDetailed(clearObservation, balancedTraining, 99);
    expect(result.neighbors).toHaveLength(4);
    expect(result.neighbors[0].observation.id).toBe('signal-a');
    expect(result.neighbors[0].distance).toBe(1);
    expect(result.votes).toEqual({ signal: 2, parasite: 2 });
    expect(result.predictedClass).toBe('parasite'); // égalité prudente
    expect(result.tieRule).toBe('parasite');
    expect(result.tieApplied).toBe(true);
    expect(JSON.stringify(balancedTraining)).toBe(snapshot);
  });

  it('départage les distances identiques par identifiant et ignore les exemples sans étiquette', () => {
    const points = [
      { id: 'z', name: 'Z', brightness: 9, regularity: 8, label: 'signal' as const },
      { id: 'a', name: 'A', brightness: 7, regularity: 8, label: 'parasite' as const },
      { id: 'none', name: 'Sans classe', brightness: 8, regularity: 8 },
    ];
    expect(classifyDetailed(clearObservation, points, 2).neighbors.map(({ observation }) => observation.id)).toEqual(['a', 'z']);
    expect(classifyDetailed(clearObservation, points, 1).predictedClass).toBe('parasite');
  });

  it('classe les quatre observations avec le même moteur et montre le changement de vote', () => {
    expect(newObservations.map((item) => classify(item, balancedTraining))).toEqual(['signal', 'signal', 'parasite', 'parasite']);
    expect(classifyDetailed(clearObservation, balancedTraining).votes).toEqual({ signal: 2, parasite: 1 });
    expect(classifyDetailed(clearObservation, balancedTraining).tieApplied).toBe(false);
    expect(classifyDetailed(ambiguousObservation, biasedTraining).votes).toEqual({ signal: 1, parasite: 2 });
  });
});

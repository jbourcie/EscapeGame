import { describe, expect, it } from 'vitest';
import { ambiguousObservation, balancedTraining, biasedTraining, classify, clearObservation } from './classifier';

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
  });
});

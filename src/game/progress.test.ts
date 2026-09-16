import { describe, expect, it } from 'vitest';
import { missions } from '../data/missions';
import { clearProgress, initialProgress, isFinaleUnlocked, loadProgress, saveProgress, STORAGE_KEY, validateFragment } from './progress';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe('validation des fragments', () => {
  it('refuse une erreur, compte la tentative et ne révèle aucun fragment', () => {
    const result = validateFragment(initialProgress(), 'components', '8');
    expect(result.correct).toBe(false);
    expect(result.progress.attempts.components).toBe(1);
    expect(result.progress.fragments.components).toBeUndefined();
  });

  it('valide uniquement la réponse centralisée de la mission', () => {
    const result = validateFragment(initialProgress(), 'components', '4');
    expect(result.correct).toBe(true);
    expect(result.progress.completed).toContain('components');
    expect(result.progress.fragments.components).toBe('4');
  });

  it('affiche automatiquement les indices à partir des deuxième et troisième erreurs', () => {
    let progress = initialProgress();
    progress = validateFragment(progress, 'memory', '0').progress;
    expect(progress.hints.memory ?? 0).toBe(0);
    progress = validateFragment(progress, 'memory', '0').progress;
    expect(progress.hints.memory).toBe(1);
    progress = validateFragment(progress, 'memory', '0').progress;
    expect(progress.hints.memory).toBe(2);
  });
});

describe('finale', () => {
  it('reste verrouillée tant qu’une mission manque', () => {
    const progress = { ...initialProgress(), completed: missions.slice(0, 5).map(({ id }) => id) };
    expect(isFinaleUnlocked(progress)).toBe(false);
  });

  it('se débloque après les six validations', () => {
    const progress = { ...initialProgress(), completed: missions.map(({ id }) => id) };
    expect(isFinaleUnlocked(progress)).toBe(true);
  });
});

describe('persistance locale', () => {
  it('restaure une progression enregistrée', () => {
    const storage = memoryStorage();
    const progress = { ...initialProgress(), level: 'scientist' as const, completed: ['program'], fragments: { program: '7' }, programBlocks: ['repeat-a', 'right', 'repeat-b'] };
    saveProgress(progress, storage);
    expect(loadProgress(storage)).toMatchObject(progress);
  });

  it('retombe sur un état sûr si le stockage est corrompu', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{cassé');
    expect(loadProgress(storage)).toEqual(initialProgress());
  });

  it('efface complètement la partie', () => {
    const storage = memoryStorage();
    saveProgress({ ...initialProgress(), level: 'expert' }, storage);
    clearProgress(storage);
    expect(loadProgress(storage)).toEqual(initialProgress());
  });
});

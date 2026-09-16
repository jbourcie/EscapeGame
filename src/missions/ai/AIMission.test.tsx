// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMission } from '../../data/missions';
import { initialProgress, loadProgress, saveProgress, type Progress } from '../../game/progress';
import { AIMission } from './AIMission';

function Harness({ initial = initialProgress() }: { initial?: Progress }) {
  const [progress, setProgress] = useState(initial);
  return <><AIMission mission={getMission('ai')!} progress={progress} onProgress={(change) => setProgress((current) => {
    const next = typeof change === 'function' ? change(current) : change;
    saveProgress(next);
    return next;
  })} onBack={() => undefined} /><output data-testid="progress">{JSON.stringify(progress)}</output></>;
}

async function reachDemo(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Signal intéressant.*Toucher pour observer/i }));
  await user.click(screen.getByRole('button', { name: /Parasite.*Toucher pour observer/i }));
  await user.click(screen.getByRole('button', { name: /J’ai compris les exemples/i }));
}

async function reachTraining(user: ReturnType<typeof userEvent.setup>) {
  await reachDemo(user);
  await user.click(screen.getByRole('button', { name: /Voir la comparaison/i }));
  for (let step = 0; step < 5; step++) await user.click(screen.getByRole('button', { name: /Continuer/i }));
  await user.click(screen.getByRole('button', { name: /Sur les exemples les plus proches/i }));
  await user.click(screen.getByRole('button', { name: /Je peux entraîner la machine/i }));
}

async function classifyOne(user: ReturnType<typeof userEvent.setup>, id: string, family: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(`${id}.*Luminosité`, 'i') }));
  await user.click(screen.getByRole('button', { name: new RegExp(`Famille ${family}.*déposer`, 'i') }));
  await user.click(screen.getByRole('button', { name: /Voir l’observation suivante|Découvrir si l’IA peut se tromper/i }));
}

afterEach(() => { cleanup(); localStorage.clear(); });

describe('mission IA guidée', () => {
  it('ouvre à l’étape 1 avec deux exemples seulement et une aide contextuelle', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByLabelText(/Étape 1 sur 4/i)).toBeTruthy();
    expect(screen.queryByRole('group', { name: /Carte du ciel/i })).toBeNull();
    expect(screen.getByRole('button', { name: /J’ai compris les exemples/i }).hasAttribute('disabled')).toBe(true);
    await user.click(screen.getByRole('button', { name: /Besoin d’aide/i }));
    expect(screen.getByText(/Observe l’étoile et le losange/i)).toBeTruthy();
    await reachDemo(user);
    expect(screen.getByLabelText(/Étape 2 sur 4/i)).toBeTruthy();
    expect(screen.queryByText(/données déséquilibrées/i)).toBeNull();
  });

  it('adapte les mots et le détail facultatif aux trois âges', async () => {
    const user = userEvent.setup();
    const explorer = render(<Harness initial={{ ...initialProgress(), level: 'explorer' }} />);
    expect(screen.getByRole('button', { name: /Signal intéressant.*beaucoup.*beaucoup/i })).toBeTruthy();
    expect(screen.queryByText(/Que sont les caractéristiques/i)).toBeNull();
    explorer.unmount();
    const scientist = render(<Harness initial={{ ...initialProgress(), level: 'scientist' }} />);
    expect(screen.getByRole('button', { name: /Signal intéressant.*8\/10.*9\/10/i })).toBeTruthy();
    scientist.unmount();
    render(<Harness initial={{ ...initialProgress(), level: 'expert' }} />);
    expect(screen.getByText(/Que sont les caractéristiques/i)).toBeTruthy();
    await user.click(screen.getByText(/Que sont les caractéristiques/i));
    expect(screen.getByText(/couple \(luminosité, régularité\)/i)).toBeTruthy();
  });

  it('révèle la démonstration progressivement, corrige sans pénalité et reprend au milieu', async () => {
    const user = userEvent.setup();
    const first = render(<Harness />);
    await reachDemo(user);
    expect(screen.queryByText(/Les voisins retenus votent/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Voir la comparaison/i }));
    expect(loadProgress().aiMission.demoStep).toBe(1);
    first.unmount();
    render(<Harness initial={loadProgress()} />);
    expect(screen.getByText(/Le nouveau point apparaît/i)).toBeTruthy();
    for (let step = 0; step < 5; step++) await user.click(screen.getByRole('button', { name: /Continuer/i }));
    await user.click(screen.getByRole('button', { name: /réponse choisie au hasard/i }));
    expect(screen.getByText(/Essaie encore : la machine ne devine pas/i)).toBeTruthy();
    expect(loadProgress().attempts.ai).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /Sur les exemples les plus proches/i }));
    expect(screen.getByText(/Oui ! Elle compare avec les exemples/i)).toBeTruthy();
    expect(screen.getByLabelText(/Étape 2 sur 4/i)).toBeTruthy();
  });

  it('refuse un mauvais placement, accepte sélection puis dépôt, et conserve les autres fragments au reset', async () => {
    const user = userEvent.setup();
    const first = render(<Harness initial={{ ...initialProgress(), fragments: { components: '4' }, completed: ['components'] }} />);
    await reachTraining(user);
    await user.click(screen.getByRole('button', { name: /O1.*Luminosité/i }));
    await user.click(screen.getByRole('button', { name: /Famille parasite.*déposer/i }));
    expect(screen.getByText(/O1 n’est pas dans cette famille/i)).toBeTruthy();
    expect(loadProgress().aiMission.placements.o1).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /O1.*Luminosité/i }));
    await user.click(screen.getByRole('button', { name: /Famille signal.*déposer/i }));
    expect(screen.getByRole('heading', { name: /O1 rejoint les exemples connus/i })).toBeTruthy();
    first.unmount();
    render(<Harness initial={loadProgress()} />);
    expect(screen.getByRole('heading', { name: /O1 rejoint les exemples connus/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Réinitialiser la mission IA/i }));
    expect(loadProgress().aiMission.phase).toBe(1);
    expect(loadProgress().fragments.components).toBe('4');
  });

  it('accepte un glissement tactile et montre une observation à la fois', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await reachTraining(user);
    const item = screen.getByRole('button', { name: /O1.*Luminosité/i });
    const target = screen.getByRole('button', { name: /Famille signal/i });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn(() => target) });
    fireEvent.pointerDown(item, { pointerId: 3, pointerType: 'touch', clientX: 2, clientY: 2 });
    fireEvent.pointerMove(item, { pointerId: 3, pointerType: 'touch', clientX: 90, clientY: 60 });
    fireEvent.pointerUp(item, { pointerId: 3, pointerType: 'touch', clientX: 90, clientY: 60 });
    expect(loadProgress().aiMission.placements.o1).toBe('signal');
    expect(screen.queryByRole('button', { name: /O2.*Luminosité/i })).toBeNull();
    await user.click(screen.getByRole('button', { name: /Voir l’observation suivante/i }));
    expect(screen.getByRole('button', { name: /O2.*Luminosité/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /O1, signal, luminosité 8, régularité 8/i })).toBeTruthy();
  });

  it('compare successivement les deux jeux et n’accorde le 6 qu’à la fin', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await reachTraining(user);
    for (const [id, family] of [['O1', 'signal'], ['O2', 'signal'], ['O3', 'parasite'], ['O4', 'parasite']]) await classifyOne(user, id, family);
    expect(screen.getByLabelText(/Étape 4 sur 4/i)).toBeTruthy();
    expect(loadProgress().fragments.ai).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /^IA mal entraînée$/i }));
    expect(screen.getByText(/l’autre machine a deux exemples/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /^IA bien entraînée$/i }));
    await user.click(screen.getByRole('button', { name: /Tester l’IA bien entraînée/i }));
    expect(screen.queryByText(/La méthode n’a pas changé/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Tester l’IA mal entraînée/i }));
    expect(screen.getByText(/La méthode n’a pas changé/i)).toBeTruthy();
    expect(loadProgress().fragments.ai).toBeUndefined();
    await user.click(screen.getByRole('button', { name: /révéler le fragment/i }));
    expect(loadProgress().fragments.ai).toBe('6');
    expect(screen.queryByLabelText(/Quel chiffre apparaît/i)).toBeNull();
  });

  it('reprend la comparaison au même sous-écran après rechargement', async () => {
    const user = userEvent.setup();
    const initial = { ...initialProgress(), aiMission: { ...initialProgress().aiMission, phase: 4 as const, consulted: ['signal-a', 'parasite-a'], demoStep: 6, demoAnswerCorrect: true, placements: { o1: 'signal' as const, o2: 'signal' as const, o3: 'parasite' as const, o4: 'parasite' as const } } };
    const first = render(<Harness initial={initial} />);
    await user.click(screen.getByRole('button', { name: /^IA bien entraînée$/i }));
    await user.click(screen.getByRole('button', { name: /Tester l’IA bien entraînée/i }));
    expect(loadProgress().aiMission.comparisonStep).toBe(2);
    first.unmount();
    render(<Harness initial={loadProgress()} />);
    expect(screen.getByRole('button', { name: /Tester l’IA mal entraînée/i })).toBeTruthy();
    expect(loadProgress().fragments.ai).toBeUndefined();
  });
});

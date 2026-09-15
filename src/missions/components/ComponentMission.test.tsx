// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { missions } from '../../data/missions';
import { initialProgress, type Progress } from '../../game/progress';
import { ComponentMission } from './ComponentMission';

const mission = missions[0];

afterEach(() => cleanup());

function Harness({ level = 'scientist' as const }: { level?: 'explorer' | 'scientist' | 'expert' }) {
  const [progress, setProgress] = useState<Progress>({ ...initialProgress(), level });
  return <ComponentMission mission={mission} progress={progress} onProgress={setProgress} onBack={() => undefined} />;
}

async function place(user: ReturnType<typeof userEvent.setup>, item: RegExp, target: RegExp) {
  await user.click(screen.getByRole('button', { name: item }));
  await user.click(screen.getByRole('button', { name: target }));
}

describe('mission numérique Composants', () => {
  it('permet l’alternative sélectionner puis déposer et verrouille la bonne pièce', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await place(user, /Processeur/i, /Calculer et exécuter/i);
    expect(screen.getByLabelText(/1 composant installé sur 4/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Calculer et exécuter.*emplacement occupé/i }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.queryByRole('button', { name: /Processeur.*Il exécute/i })).toBeNull();
  });

  it('annule la sélection au second toucher sur la même pièce', async () => {
    const user = userEvent.setup();
    render(<Harness level="explorer" />);
    const processor = screen.getByRole('button', { name: /Processeur/i });
    await user.click(processor);
    expect(processor.getAttribute('aria-pressed')).toBe('true');
    await user.click(processor);
    expect(processor.getAttribute('aria-pressed')).toBe('false');
  });

  it('refuse une destination incorrecte et explique l’erreur', async () => {
    const user = userEvent.setup();
    render(<Harness level="expert" />);
    await place(user, /Mémoire vive/i, /aucune tension/i);
    expect(screen.getByText(/Incompatibilité/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Mémoire vive/i })).toBeTruthy();
    expect(screen.getByLabelText(/0 composants installés sur 4/i)).toBeTruthy();
  });

  it('accepte un glissement simulé au doigt', () => {
    render(<Harness />);
    const item = screen.getByRole('button', { name: /Stockage/i });
    const target = screen.getByRole('button', { name: /Conserver les fichiers après/i });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn(() => target) });
    fireEvent.pointerDown(item, { pointerId: 4, pointerType: 'touch', clientX: 10, clientY: 10 });
    fireEvent.pointerMove(item, { pointerId: 4, pointerType: 'touch', clientX: 90, clientY: 60 });
    fireEvent.pointerUp(item, { pointerId: 4, pointerType: 'touch', clientX: 90, clientY: 60 });
    expect(screen.getByLabelText(/1 composant installé sur 4/i)).toBeTruthy();
  });

  it('réussit après quatre placements, enregistre 4 et ne montre aucun champ manuel', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await place(user, /Processeur/i, /Calculer et exécuter/i);
    await place(user, /Mémoire vive/i, /Conserver temporairement/i);
    await place(user, /Stockage/i, /Conserver les fichiers après/i);
    await place(user, /Alimentation/i, /Fournir et distribuer/i);
    expect(screen.getByLabelText(/Fragment découvert : 4/i)).toBeTruthy();
    expect(screen.getByText(/Fragment 1 enregistré automatiquement/i)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('remet à zéro une mission partiellement jouée', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await place(user, /Processeur/i, /Calculer et exécuter/i);
    await user.click(screen.getByRole('button', { name: /Remettre ce module à zéro/i }));
    expect(screen.getByLabelText(/0 composants installés sur 4/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Processeur/i })).toBeTruthy();
  });
});

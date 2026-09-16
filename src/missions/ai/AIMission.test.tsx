// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMission } from '../../data/missions';
import { initialProgress, loadProgress, saveProgress, type Progress } from '../../game/progress';
import { AIMission } from './AIMission';
import { useState } from 'react';

function Harness({ initial = initialProgress() }: { initial?: Progress }) {
  const [progress, setProgress] = useState(initial);
  const mission = getMission('ai')!;
  return <><AIMission mission={mission} progress={progress} onProgress={(change) => setProgress((current) => {
    const next = typeof change === 'function' ? change(current) : change;
    saveProgress(next);
    return next;
  })} onBack={() => undefined} /><output data-testid="progress">{JSON.stringify(progress)}</output></>;
}

async function reachClassification(user: ReturnType<typeof userEvent.setup>) {
  const list = screen.getByRole('heading', { name: /Mémoire d’apprentissage/i }).parentElement!;
  for (const name of ['Signal A', 'Signal B', 'Parasite A', 'Parasite B']) await user.click(within(list).getByRole('button', { name: new RegExp(name, 'i') }));
  await user.click(screen.getByRole('button', { name: /La machine a observé les exemples/i }));
}

afterEach(() => { cleanup(); localStorage.clear(); });

describe('mission IA interactive', () => {
  it('consulte les exemples puis refuse une mauvaise famille sans révéler le fragment', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('button', { name: /La machine a observé les exemples/i }).hasAttribute('disabled')).toBe(true);
    await reachClassification(user);
    expect(screen.queryByLabelText(/Quel chiffre apparaît/i)).toBeNull();
    await user.click(screen.getByRole('button', { name: /O1.*Luminosité/i }));
    expect(screen.getByRole('heading', { name: /O1 · luminosité 8, régularité 8/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Famille parasite.*déposer/i }));
    expect(screen.getByText(/O1 ressemble davantage aux signaux/i)).toBeTruthy();
    expect(JSON.parse(screen.getByTestId('progress').textContent!).fragments.ai).toBeUndefined();
  });

  it('reprend la phase et les placements, puis réinitialise seulement l’IA', async () => {
    const user = userEvent.setup();
    const other = { ...initialProgress(), fragments: { components: '4' }, completed: ['components'] };
    const first = render(<Harness initial={other} />);
    await reachClassification(user);
    await user.click(screen.getByRole('button', { name: /O1.*Luminosité/i }));
    await user.click(screen.getByRole('button', { name: /Famille signal.*déposer/i }));
    expect(loadProgress().aiMission.placements.o1).toBe('signal');
    first.unmount();
    render(<Harness initial={loadProgress()} />);
    expect(screen.getByRole('heading', { name: /Observations à classer · 1\/4/i })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Réinitialiser la mission IA/i }));
    const saved = loadProgress();
    expect(saved.aiMission.phase).toBe(1);
    expect(saved.aiMission.placements).toEqual({});
    expect(saved.fragments.components).toBe('4');
  });

  it('accepte le glissement tactile vers une famille', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await reachClassification(user);
    const item = screen.getByRole('button', { name: /O3.*Luminosité/i });
    const target = screen.getByRole('button', { name: /Famille parasite/i });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: vi.fn(() => target) });
    fireEvent.pointerDown(item, { pointerId: 3, pointerType: 'touch', clientX: 2, clientY: 2 });
    fireEvent.pointerMove(item, { pointerId: 3, pointerType: 'touch', clientX: 90, clientY: 60 });
    fireEvent.pointerUp(item, { pointerId: 3, pointerType: 'touch', clientX: 90, clientY: 60 });
    expect(loadProgress().aiMission.placements.o3).toBe('parasite');
  });
});

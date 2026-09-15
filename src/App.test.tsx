// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { finalCode, missions } from './data/missions';

async function placeComponent(user: ReturnType<typeof userEvent.setup>, item: RegExp, target: RegExp) {
  await user.click(screen.getByRole('button', { name: item }));
  await user.click(screen.getByRole('button', { name: target }));
}

async function solveComponents(user: ReturnType<typeof userEvent.setup>) {
  await placeComponent(user, /Processeur/i, /Calculer et exécuter/i);
  await placeComponent(user, /Mémoire vive/i, /Conserver temporairement/i);
  await placeComponent(user, /Stockage/i, /Conserver les fichiers après/i);
  await placeComponent(user, /Alimentation/i, /Fournir et distribuer/i);
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  window.confirm = vi.fn(() => true);
});

afterEach(() => cleanup());

describe('parcours d’équipe', () => {
  it('joue les six missions, débloque la finale et redémarre la machine', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Commencer la mission/i }));
    await user.click(screen.getByRole('button', { name: /^Scientifique/i }));

    for (const [index, mission] of missions.entries()) {
      await user.click(screen.getByRole('button', { name: new RegExp(mission.shortTitle, 'i') }));
      if (index === 0) {
        expect(screen.queryByLabelText(/Quel chiffre apparaît/i)).toBeNull();
        await placeComponent(user, /Processeur/i, /Conserver les fichiers après/i);
        expect(screen.getByText(/Cette zone doit plutôt conserver les fichiers/i)).toBeTruthy();
        await solveComponents(user);
      } else {
        const input = screen.getByLabelText(/Quel chiffre apparaît/i);
        await user.type(input, mission.answer);
        await user.click(screen.getByRole('button', { name: /Tester le fragment/i }));
      }
      expect(screen.getByRole('heading', { name: index === 0 ? /Le cœur de la machine bat/i : /Module réparé/i })).toBeTruthy();
      await user.click(screen.getByRole('button', { name: /Retourner à la carte/i }));
    }

    await user.click(screen.getByRole('button', { name: /Le redémarrage est prêt/i }));
    await user.type(screen.getByLabelText(/Les six chiffres/i), finalCode);
    await user.click(screen.getByRole('button', { name: /Relancer la machine/i }));
    expect(screen.getByRole('heading', { name: /Les observations/i })).toBeTruthy();
  });

  it('reprend la progression enregistrée après un nouveau rendu', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('button', { name: /Commencer la mission/i }));
    await user.click(screen.getByRole('button', { name: /Explorateur/i }));
    await user.click(screen.getByRole('button', { name: /Composants/i }));
    await placeComponent(user, /Processeur/i, /Faire les calculs/i);
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Reprendre la partie/i }));
    await user.click(screen.getByRole('button', { name: /Composants.*En cours/i }));
    expect(screen.getByLabelText(/1 composant installé sur 4/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Processeur.*Il fait les calculs/i })).toBeNull();
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { finalCode, missions } from './data/missions';

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
      const input = screen.getByLabelText(/Quel chiffre apparaît/i);

      if (index === 0) {
        await user.type(input, '0');
        await user.click(screen.getByRole('button', { name: /Tester le fragment/i }));
        expect(screen.getByText(/Ce fragment ne réagit pas/i)).toBeTruthy();
      }

      await user.type(input, mission.answer);
      await user.click(screen.getByRole('button', { name: /Tester le fragment/i }));
      expect(screen.getByRole('heading', { name: /Module réparé/i })).toBeTruthy();
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
    await user.type(screen.getByLabelText(/Quel chiffre apparaît/i), '4');
    await user.click(screen.getByRole('button', { name: /Tester le fragment/i }));
    first.unmount();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Reprendre la partie/i }));
    expect(screen.getByRole('button', { name: /Composants.*Validée/i })).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
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

async function solveProgram(user: ReturnType<typeof userEvent.setup>) {
  const reserve = screen.getByRole('heading', { name: /Blocs disponibles/i }).closest('aside')!;
  let repeats = within(reserve).getAllByRole('button', { name: /Répéter 4× avancer/i });
  await user.click(repeats[0]); await user.click(screen.getByRole('button', { name: /Position 1, vide/i }));
  await user.click(within(reserve).getAllByRole('button', { name: /Tourner à droite/i })[0]); await user.click(screen.getByRole('button', { name: /Position 2, vide/i }));
  repeats = within(reserve).getAllByRole('button', { name: /Répéter 4× avancer/i });
  await user.click(repeats[0]); await user.click(screen.getByRole('button', { name: /Position 3, vide/i }));
  await user.click(screen.getByRole('button', { name: /Exécuter/i }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /La constellation d’Orion/i })).toBeTruthy());
}

async function solveMemory(user: ReturnType<typeof userEvent.setup>) {
  for (const title of ['Calcul en cours','Onglet actuellement ouvert','Position actuelle de l’automate','Image modifiée non enregistrée']) { await user.click(screen.getByRole('button',{name:new RegExp(title,'i')})); await user.click(screen.getByRole('button',{name:/Table de travail/i})); }
  for (const title of ['Photographie enregistrée','Carnet scientifique sauvegardé','Carte téléchargée','Archive d’observations']) { await user.click(screen.getByRole('button',{name:new RegExp(title,'i')})); await user.click(screen.getByRole('button',{name:/Bibliothèque/i})); }
}

async function solveData(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Poids 4, étoile éteinte/i }));
  await user.click(screen.getByRole('button', { name: /Poids 1, étoile éteinte/i }));
  await user.click(screen.getByRole('button', { name: /Vérifier l’observation/i }));
}

async function solveEverywhere(user: ReturnType<typeof userEvent.setup>) {
  await placeComponent(user, /Capteur de luminosité/i, /Capteur, observe/i);
  await placeComponent(user, /Règle programmée/i, /Programme, décide/i);
  await placeComponent(user, /Lampe commandée/i, /Action, agit/i);
  await user.click(screen.getByRole('button', { name: /Tester le système/i }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /La lampe révèle/i })).toBeTruthy());
}

async function solveAI(user: ReturnType<typeof userEvent.setup>) {
  for (const name of ['Signal A', 'Signal B', 'Parasite A', 'Parasite B']) await user.click(screen.getByRole('button', { name: new RegExp(`${name}.*voir`, 'i') }));
  await user.click(screen.getByRole('button', { name: /La machine a observé les exemples/i }));
  for (const [id, family] of [['O1','signal'],['O2','signal'],['O3','parasite'],['O4','parasite']]) {
    await user.click(screen.getByRole('button', { name: new RegExp(`${id}.*Luminosité`, 'i') }));
    await user.click(screen.getByRole('button', { name: new RegExp(`Famille ${family}.*déposer`, 'i') }));
  }
  await user.click(screen.getByRole('button', { name: /Analyser le jeu équilibré/i }));
  await user.click(screen.getByRole('button', { name: /Ajouter beaucoup d’exemples parasites/i }));
  await user.click(screen.getByRole('button', { name: /Conclure l’enquête/i }));
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
      } else if (mission.id === 'program') {
        await solveProgram(user);
      } else if (mission.id === 'memory') {
        await solveMemory(user);
      } else if (mission.id === 'data') {
        await solveData(user);
      } else if (mission.id === 'everywhere') {
        await solveEverywhere(user);
      } else if (mission.id === 'ai') {
        await solveAI(user);
      } else {
        const input = screen.getByLabelText(/Quel chiffre apparaît/i);
        await user.type(input, mission.answer);
        await user.click(screen.getByRole('button', { name: /Tester le fragment/i }));
      }
      if (!['program','everywhere'].includes(mission.id)) expect(screen.getByRole('heading', { name: mission.id === 'components' ? /Le cœur de la machine bat/i : mission.id === 'memory' ? /La bibliothèque révèle/i : mission.id === 'data' ? /Le message céleste/i : /Les observations révèlent le 6/i })).toBeTruthy();
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

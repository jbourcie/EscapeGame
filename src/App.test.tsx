// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { initialProgress, loadProgress, saveProgress, type Progress } from './game/progress';
import { finalCode, missions, levels } from './data/missions';

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
  await user.click(screen.getByRole('button', { name: /Signal intéressant.*Toucher pour observer/i }));
  await user.click(screen.getByRole('button', { name: /Parasite.*Toucher pour observer/i }));
  await user.click(screen.getByRole('button', { name: /J’ai compris les exemples/i }));
  await user.click(screen.getByRole('button', { name: /Voir la comparaison/i }));
  for (let step = 0; step < 5; step++) await user.click(screen.getByRole('button', { name: /Continuer/i }));
  await user.click(screen.getByRole('button', { name: /Sur les exemples les plus proches/i }));
  await user.click(screen.getByRole('button', { name: /Je peux entraîner la machine/i }));
  for (const [id, family] of [['O1','signal'],['O2','signal'],['O3','parasite'],['O4','parasite']]) {
    await user.click(screen.getByRole('button', { name: new RegExp(`${id}.*Luminosité`, 'i') }));
    await user.click(screen.getByRole('button', { name: new RegExp(`Famille ${family}.*déposer`, 'i') }));
    await user.click(screen.getByRole('button', { name: /Voir l’observation suivante|Découvrir si l’IA peut se tromper/i }));
  }
  await user.click(screen.getByRole('button', { name: /^IA bien entraînée$/i }));
  await user.click(screen.getByRole('button', { name: /Tester l’IA bien entraînée/i }));
  await user.click(screen.getByRole('button', { name: /Tester l’IA mal entraînée/i }));
  await user.click(screen.getByRole('button', { name: /Comparer les deux réponses/i }));
  await user.click(screen.getByRole('button', { name: /révéler le fragment/i }));
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  // jsdom omits CSS.escape; the radio name is a plain, controlled identifier.
  Object.defineProperty(window, 'CSS', { configurable: true, value: { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`) } });
  window.confirm = vi.fn(() => true);
});

afterEach(() => cleanup());

describe('parcours d’équipe', () => {
  it('joue les six missions, débloque la finale et redémarre la machine', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: /^Scientifique/i }));
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/i }));

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
      expect(screen.getByLabelText(`Fragment ${mission.answer} transmis à la machine centrale`)).toBeTruthy();
      expect(document.activeElement).toBe(screen.getByLabelText(`Fragment ${mission.answer} transmis à la machine centrale`).closest('section'));
      expect(loadProgress().fragments[mission.id]).toBe(mission.answer);
      await user.click(screen.getByRole('button', { name: /Retourner au laboratoire/i }));
    }

    expect(screen.getByLabelText(/Code reconstitué automatiquement/i).textContent).toBe(finalCode);
    expect(screen.queryByRole('textbox')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Réveiller la machine/i }));
    await user.click(screen.getByRole('button', { name: /Passer l’animation/i }));
    await user.click(screen.getByRole('button', { name: /Découvrir notre réussite/i }));
    expect(screen.getByRole('heading', { name: /Machine réveillée/i })).toBeTruthy();
  });

  it('reprend la progression enregistrée après un nouveau rendu', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole('radio', { name: /Explorateur/i }));
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/i }));
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

function completedProgress(count = 6): Progress {
  const completed = missions.slice(0, count);
  return { ...initialProgress(), level: 'scientist', started: completed.map(m => m.id), completed: completed.map(m => m.id), fragments: Object.fromEntries(completed.map(m => [m.id, m.answer])) };
}
async function enterSavedFinale(user: ReturnType<typeof userEvent.setup>) {
  saveProgress(completedProgress());
  render(<App/>);
  await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/i }));
  await user.click(screen.getByRole('button', { name: /Le redémarrage est prêt/i }));
}
async function showVictory(user: ReturnType<typeof userEvent.setup>) {
  await enterSavedFinale(user);
  await user.click(screen.getByRole('button', { name: /Réveiller la machine/i }));
  await user.click(screen.getByRole('button', { name: /Passer l’animation/i }));
  await user.click(screen.getByRole('button', { name: /Découvrir notre réussite/i }));
}

describe('aventure et finition commune', () => {
  it.each(levels)('choisit $name depuis l’accueil et ouvre six missions libres', async (level) => {
    const user = userEvent.setup(); render(<App/>);
    expect(screen.getByRole('heading', { name: /Le Mystère de la.*Machine d’Abbadia/ })).toBeTruthy();
    await user.click(screen.getByRole('radio', { name: new RegExp(level.name) }));
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    expect(loadProgress().level).toBe(level.id);
    for (const mission of missions) expect((screen.getByRole('button', { name: new RegExp(`${mission.shortTitle}.*Disponible`) }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText('0 mécanismes réveillés sur 6')).toBeTruthy();
  });
  it('montre les états disponible, commencé, sélectionné et terminé puis les restaure', async () => {
    const user = userEvent.setup(); saveProgress(completedProgress(1));
    const first = render(<App/>);
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    expect(screen.getByRole('button', { name: /Composants.*Terminée.*fragment 4/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Programme.*Disponible/ }));
    await user.click(screen.getByRole('button', { name: /Retour au laboratoire/ }));
    expect(screen.getByRole('button', { name: /Programme.*En cours/ }).getAttribute('aria-current')).toBe('true');
    first.unmount(); render(<App/>);
    await user.click(screen.getByRole('button', { name: /Reprendre la partie/ }));
    expect(screen.getByRole('button', { name: /Programme.*En cours/ })).toBeTruthy();
    expect(screen.getByText('1 mécanisme réveillé sur 6')).toBeTruthy();
  });
  it.each([0, 5])('empêche la finale avec %i fragments', async (count) => {
    const user = userEvent.setup(); saveProgress(completedProgress(count)); render(<App/>);
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    const gate = screen.getByRole('button', { name: /La machine attend ses six fragments/ });
    expect((gate as HTMLButtonElement).disabled).toBe(true);
    await user.click(gate);
    expect(screen.queryByLabelText(/Code reconstitué/)).toBeNull();
  });
  it('assemble les fragments par ordre de mission et progresse sans saisie', async () => {
    const user = userEvent.setup(); await enterSavedFinale(user);
    expect(screen.getByLabelText(/Code reconstitué/).textContent).toBe('472596');
    expect(screen.queryByRole('textbox')).toBeNull();
    await user.click(screen.getByRole('button', { name: /Réveiller la machine/ }));
    await waitFor(() => expect(screen.getByText(/2 mécanismes activés/)).toBeTruthy());
  });
  it('permet de revoir les six découvertes', async () => {
    const user = userEvent.setup(); await showVictory(user);
    await user.click(screen.getByRole('button', { name: /Revoir mes découvertes/ }));
    for (const mission of missions) expect(screen.getByText(mission.learning, { exact: false })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Retour à la réussite/ }));
    expect(screen.getByRole('heading', { name: /Machine réveillée/ })).toBeTruthy();
  });
  it('rejoue une vraie mission vierge sans effacer les fragments acquis', async () => {
    const user = userEvent.setup(); await showVictory(user);
    await user.click(screen.getByRole('button', { name: /Rejouer une mission/ }));
    await user.click(screen.getByRole('button', { name: /Données.*Terminée/ }));
    expect(screen.queryByLabelText('Fragment 5 transmis à la machine centrale')).toBeNull();
    await solveData(user);
    expect(screen.getByLabelText('Fragment 5 transmis à la machine centrale')).toBeTruthy();
    expect(loadProgress().completed).toHaveLength(6);
    expect(loadProgress().binaryBits).toEqual([0,0,0,0]);
    await user.click(screen.getByRole('button', { name: /Retourner au laboratoire/ }));
    expect(screen.getByRole('heading', { name: /Réveille la machine/ })).toBeTruthy();
  });
  it('confirme l’effacement à la victoire, conserve la partie en cas d’annulation', async () => {
    const user = userEvent.setup(); await showVictory(user);
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await user.click(screen.getByRole('button', { name: /Nouvelle équipe/ }));
    expect(loadProgress().completed).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: /Nouvelle équipe/ }));
    expect(window.confirm).toHaveBeenCalledTimes(2);
    expect(loadProgress()).toEqual(initialProgress());
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Reprendre la partie/ })).toBeNull();
  });
  it('revient à l’accueil sans effacer le niveau ni la progression', async () => {
    const user = userEvent.setup(); saveProgress(completedProgress(2)); render(<App/>);
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    await user.click(screen.getByRole('button', { name: /Retour à l’accueil/ }));
    expect(loadProgress().completed).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Reprendre la partie/ })).toBeTruthy();
  });
  it('permet de changer de niveau sans perdre les fragments', async () => {
    const user = userEvent.setup(); saveProgress(completedProgress(3)); render(<App/>);
    await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    await user.click(screen.getByRole('button', { name: /Changer de niveau/ }));
    await user.click(screen.getByRole('button', { name: /^Expert/ }));
    expect(loadProgress().level).toBe('expert'); expect(loadProgress().completed).toHaveLength(3);
  });
  it('désactive et mémorise les animations et permet de parcourir la finale étape par étape', async () => {
    const user = userEvent.setup(); await enterSavedFinale(user);
    await user.click(screen.getByRole('button', { name: /Animations : oui/ }));
    expect(localStorage.getItem('abbadia-motion')).toBe('off');
    await user.click(screen.getByRole('button', { name: /Réveiller la machine/ }));
    expect(screen.queryByRole('button', { name: /Passer l’animation/ })).toBeNull();
    for (let i = 0; i < 7; i++) await user.click(screen.getByRole('button', { name: /Continuer le réveil/ }));
    expect(screen.getByRole('heading', { name: /Le château s’illumine/ })).toBeTruthy();
  });
  it('respecte prefers-reduced-motion sans imposer d’attente', async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    try {
      const user = userEvent.setup(); await enterSavedFinale(user);
      await user.click(screen.getByRole('button', { name: /Réveiller la machine/ }));
      expect(screen.getByRole('button', { name: /Continuer le réveil/ })).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Passer l’animation/ })).toBeNull();
    } finally { window.matchMedia = original; }
  });
  it('accède au laboratoire et à une mission au clavier avec un focus utile', async () => {
    const user = userEvent.setup(); render(<App/>);
    const level = screen.getByRole('radio', { name: /Scientifique/ }); level.focus();
    await user.keyboard('{ArrowRight}');
    expect((screen.getByRole('radio', { name: /Expert/ }) as HTMLInputElement).checked).toBe(true);
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(screen.getByRole('main'));
    await user.tab(); expect(document.activeElement).toBe(screen.getByRole('button', { name: /Changer de niveau/ }));
    await user.tab(); await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /Réparer le cerveau/ })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });
});

it('achève automatiquement les six activations puis illumine le château', async () => {
  const user = userEvent.setup(); await enterSavedFinale(user);
  await user.click(screen.getByRole('button', { name: /Réveiller la machine/ }));
  await waitFor(() => expect(screen.getByRole('heading', { name: /Le château s’illumine/ })).toBeTruthy(), { timeout: 6500 });
  await user.click(screen.getByRole('button', { name: /Découvrir notre réussite/ }));
  expect(screen.getByRole('heading', { name: /Machine réveillée/ })).toBeTruthy();
}, 8000);

it('refuse le réveil si une sauvegarde contient un fragment incohérent', async () => {
  const user = userEvent.setup(); const progress = completedProgress(); progress.fragments.ai = '0';
  saveProgress(progress); render(<App/>);
  await user.click(screen.getByRole('button', { name: /Entrer dans le laboratoire/ }));
  await user.click(screen.getByRole('button', { name: /Le redémarrage est prêt/ }));
  expect((screen.getByRole('button', { name: /Réveiller la machine/ }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.queryByRole('button', { name: /Découvrir notre réussite/ })).toBeNull();
});

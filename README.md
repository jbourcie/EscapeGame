# Le dernier calcul d’Antoine d’Abbadie

Prototype fonctionnel d’un mini escape game pédagogique pour tablette. Les missions « Composants », « Programme » et « Mémoire » sont entièrement numériques et tactiles ; les trois autres missions conservent provisoirement leur fonctionnement hybride avec matériel physique. L’application n’utilise ni compte, ni backend, ni API distante.

## Prérequis et lancement

- Node.js 22.13 ou plus récent
- npm

```bash
npm install
npm run dev
```

Ouvrir l’adresse locale affichée par Vite. Pour rendre la tablette accessible sur le même réseau local, utiliser l’adresse réseau également affichée.

## Tests et build

```bash
npm test
npm run build
npm run preview
```

Le build autonome est produit dans `dist/`. Les réponses et tous les textes des missions sont centralisés dans `src/data/missions.ts`. Le code final configurable est dérivé de l’ordre de ces missions.

## Installation sur tablette

L’application doit être servie en HTTPS en production (ou depuis `localhost` pendant le développement).

- **iPad / Safari** : ouvrir le site, toucher Partager, puis « Sur l’écran d’accueil ».
- **Android / Chrome** : ouvrir le site, utiliser « Installer l’application » dans le menu, puis confirmer.

L’icône et le manifeste sont inclus localement. Une fois installée, l’application s’ouvre en mode autonome.

## Vérifier le fonctionnement hors ligne

1. Construire puis lancer `npm run preview`.
2. Ouvrir l’application une première fois en ligne et attendre son chargement complet.
3. Dans les outils du navigateur, vérifier que le service worker `sw.js` est actif.
4. Activer le mode hors ligne, puis recharger la page.
5. Parcourir les missions, valider les fragments et ouvrir la finale.

Le service worker pré-cache la coque de l’application puis conserve les fichiers JavaScript et CSS demandés lors du premier chargement. Les navigations hors ligne reviennent vers la page principale.

## Progression locale

Le niveau, les missions commencées et validées, les fragments, tentatives et indices sont conservés dans `localStorage`, uniquement sur l’appareil. « Recommencer » demande confirmation ; « Nouvelle équipe » sur la victoire efface immédiatement la progression.

## Organisation

- `PLAN.md` : parcours, règles et stratégie de vérification.
- `src/data/missions.ts` : contenu éditorial, fragments et indices.
- `src/game/` : progression persistante et classifieur IA déterministe.
- `src/game/interactions/` : moteur, hook et composants tactiles réutilisables.
- `src/missions/components/` : mini-jeu numérique de la mission Composants.
- `src/missions/program/` : grille, blocs et moteur déterministe de la mission Programme.
- `src/missions/memory/` : cartes et classification RAM/stockage de la mission Mémoire.
- `src/assets/game/` : structure des futurs objets, décors et éléments d’interface locaux.
- `docs/physical-kit.md` : matériel physique des six missions.
- `docs/future-assets.md` : courte liste des visuels à produire ensuite.
- `src/assets/placeholders/` : emplacement des futures illustrations.
- `.prompts/` : futurs prompts de génération d’assets.

## Limites volontaires de cette itération

Les illustrations des trois missions numériques sont des formes CSS temporaires. Les trois autres missions attendent encore leur migration numérique et les assets définitifs ne sont pas produits. La simulation IA est un classifieur pédagogique local par proximité numérique, pas une IA distante.

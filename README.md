# Le Mystère de la Machine d’Abbadia

Mini escape game pédagogique pour tablette. Les six missions sont entièrement numériques et tactiles. L’application n’utilise ni compte, ni backend, ni API distante.

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

Le build autonome est produit dans `dist/`. Les réponses et fragments sont centralisés dans `src/data/missions.ts` ; les textes guidés par âge de l’IA sont dans `src/missions/ai/copy.ts`. Le code final configurable est dérivé de l’ordre des missions.

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

Le service worker `abbadie-v9` pré-cache la coque, les scripts et styles du build, le château SVG et les visuels locaux dès son installation. Attendre la fin de l’installation avant de couper le réseau. Les anciens caches du jeu sont retirés à l’activation ; les caches d’autres applications sont conservés. Les navigations hors ligne reviennent vers la page principale.

## Progression locale

Le niveau, les missions commencées et validées, les fragments, tentatives et indices sont conservés dans `localStorage`, uniquement sur l’appareil. « Nouvelle équipe » demande toujours confirmation avant d’effacer la progression, depuis le laboratoire comme depuis la victoire. « Retour à l’accueil » conserve la partie.

La mission IA conserve aussi l’étape guidée, les exemples consultés, la démonstration, les observations classées, l’aide utilisée et la comparaison des deux jeux de données. Une ancienne sauvegarde IA est reprise à une étape sûre sans perdre les autres fragments. Son bouton « Réinitialiser la mission IA » ne touche pas aux cinq autres fragments. Le fragment 6 apparaît et s’enregistre après les quatre étapes.

## Organisation

- `PLAN.md` : parcours, règles et stratégie de vérification.
- `src/data/missions.ts` : contenu éditorial, fragments et indices.
- `src/game/` : progression persistante et classifieur IA déterministe.
- `src/game/interactions/` : moteur, hook et composants tactiles réutilisables.
- `src/missions/components/` : mini-jeu numérique de la mission Composants.
- `src/missions/program/` : grille, blocs et moteur déterministe de la mission Programme.
- `src/missions/memory/` : cartes et classification RAM/stockage de la mission Mémoire.
- `src/missions/data/` : pupitre astronomique et conversion binaire de la mission Données.
- `src/missions/everywhere/` : construction et simulation d’une chaîne informatique embarquée.
- `src/missions/ai/` : textes adaptés à l’âge, graphique, démonstration, classement et comparaison guidée.
- `src/assets/game/` : structure des futurs objets, décors et éléments d’interface locaux.
- `docs/physical-kit.md` : matériel physique des six missions.
- `docs/future-assets.md` : courte liste des visuels à produire ensuite.
- `src/assets/placeholders/` : emplacement des futures illustrations.
- `.prompts/` : futurs prompts de génération d’assets.

## Limites volontaires de cette itération

Le château, le guide, les icônes et la machine centrale utilisent des SVG/CSS locaux. Les surfaces interactives des six missions restent celles validées précédemment. La mission IA emploie un classifieur pédagogique local à trois voisins, pas une IA distante. Le vote affiché est une prédiction et non une probabilité ou une certitude.

## Finale, rejeu et accessibilité

Les six fragments `4`, `7`, `2`, `5`, `9`, `6` s’assemblent automatiquement en `472596`. Aucune saisie du code n’est demandée. Après le réveil, l’équipe peut revoir ses découvertes, rejouer une mission vierge sans perdre sa progression ou confirmer une remise à zéro globale.

Le bouton « Animations » mémorise une préférence sur la tablette ; `prefers-reduced-motion` est également respecté. Dans ce mode, la finale avance sur action de l’équipe. Tous les éléments importants sont des contrôles HTML accessibles au clavier. Les mises en page visent 768×1024, 1024×768 et les petites largeurs.

La validation automatique ne remplace pas une inspection visuelle : voir les étapes restantes dans [le rapport de vérification](docs/validation-finition.md).

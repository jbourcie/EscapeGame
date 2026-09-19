# Vérification de la finition — 19 septembre 2026

## Résultat

Vérification réelle avec Google Chrome 153 piloté par Playwright, sur le build de production local. Parcours complet aux dimensions **768×1024**, **1024×768** et **390×844**, y compris après coupure réseau et rechargement. Les captures ont été ouvertes et inspectées ; les tests jsdom ne sont plus la seule preuve de validation.

**98 tests réussis dans 15 fichiers**, build TypeScript/Vite réussi. Le code final reste **472596**. Aucun moteur de puzzle ni format de sauvegarde modifié, aucune dépendance d’exécution ajoutée.

## Corrections issues du navigateur

- Suppression du défilement parasite à l’accueil et des conteneurs qui gênaient le défilement du document.
- Laboratoire entièrement visible dans les deux orientations tablette ; fragments et accès à la finale rapprochés.
- Réserves et destinations côte à côte sur tablette. Grille Programme réduite et répartie sur deux ou trois colonnes selon la largeur. Destinations Mémoire et Informatique partout maintenues à l’écran pendant le défilement.
- Disposition verticale sur mobile, bouton d’entrée placé avant le château. Les pages longues restent déroulantes.
- Poids binaires séparés des étoiles ; légende du château dégagée ; bouton de retrait des instructions agrandi.
- Flèches décoratives d’Informatique partout privées d’interception des événements : leur rotation bloquait les dépôts tactiles sur mobile.
- Révélation d’un fragment amenée à l’écran avec focus sur le panneau de réussite.
- Château final affiché à la place de la machine, évitant l’ajout d’une deuxième grande scène sous le bouton.

Exemples de hauteurs avant/après, sur l’état initial Scientifique : Programme portrait **1 837 → 1 110 px**, Informatique partout paysage **1 549 → 1 072 px**. L’accueil et le laboratoire vierge tiennent dans la hauteur du viewport tablette. Le défilement vertical des autres missions reste volontaire lorsque leur contenu le nécessite.

## Parcours et captures

À chacune des trois dimensions : accueil, laboratoire vierge, six missions, six révélations, laboratoire partiel, entraînement et comparaison IA, finale, château illuminé, victoire et carnet. Le parcours utilise les véritables contrôles tactiles du navigateur, vérifie le focus des réussites, la reprise après rechargement et l’absence de débordement horizontal et d’erreur JavaScript.

Glisser-déposer tactile Composants vérifié avec des événements tactiles Chrome aux deux orientations tablette ; dépôt souris également vérifié en paysage. Défilement à la molette et maintien des destinations à l’écran vérifiés. L’alternative toucher l’objet puis la cible permet de terminer toutes les missions, y compris sur mobile.

Le script reproductible est `scripts/check-browser.mjs`. Les captures locales de cette session sont dans `/tmp/abbadia-browser-shots/` ; elles ne sont pas livrées comme assets du jeu. Le script les régénère à chaque passage, sans animation transitoire pour faciliter leur inspection.

## PWA réelle

Un premier chargement attend l’activation du service worker ; le réseau est ensuite désactivé dans le contexte Chrome. Rechargement complet puis **six missions et finale entièrement hors ligne** dans les trois formats. Une vérification séparée confirme aussi la reprise d’une saisie binaire partielle après rechargement hors ligne.

Le navigateur a révélé un échec que les mocks ne détectaient pas : `Vary: Origin` du serveur de prévisualisation faisait différer les requêtes de modules des requêtes de pré-cache. Le cache `abbadie-v10` retrouve désormais les ressources statiques de même origine indépendamment de cet en-tête. La recherche est limitée à la version courante du cache. Un test de régression couvre cette condition.

Les tests vérifient aussi le manifeste, les assets locaux, le nettoyage des anciens caches du jeu et l’absence de ressources distantes. Le test navigateur n’a observé aucune requête vers un autre domaine.

## Reproduire

Installer Playwright uniquement pour les tests, éventuellement dans un dossier temporaire extérieur au dépôt. Lancer `npm run build`, puis `npm run preview -- --host 127.0.0.1`.

```sh
PLAYWRIGHT_MODULE=/tmp/abbadia-browser-check/node_modules/playwright/index.mjs \
BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node scripts/check-browser.mjs
```

`GAME_URL` permet de changer l’adresse locale (par défaut `http://127.0.0.1:4173`) et `BROWSER_SHOTS` le dossier de captures. Le script nécessite un build de production avec service worker actif.

## Limites restantes

Validation sur Chrome macOS avec viewport et entrées tactiles émulés, pas sur une tablette physique. L’installation sur l’écran d’accueil, Safari/iPadOS, le confort au doigt et les performances sur l’appareil cible restent à vérifier. Le texte agrandi à 200 % et l’audit complet des contrastes n’ont pas été validés dans cette session. L’animation passée/réduite, le rejeu, les confirmations et le clavier sont couverts par les tests d’interface ; l’animation complète est également parcourue dans Chrome.

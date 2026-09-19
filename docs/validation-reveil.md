# Validation — Le Réveil d’Abbadia, 19 septembre 2026

## Référence et périmètre

Départ : branche `main`, commit `6582dd1`, arbre propre. Avant modification : 98 tests réussis dans 15 fichiers, build TypeScript/Vite réussi. Documentation, direction visuelle et corrections tablette du commit précédent examinées. Laboratoire vérifié sans défilement en 768×1024 et 1024×768.

Les fichiers des six missions, `src/data/missions.ts`, `src/game/progress.ts`, `src/components/Observatory.tsx` et les styles partagés existants restent inchangés. Les assertions des anciens tests de finale ont été adaptées au nouveau parcours ; les scénarios de missions et de progression sont conservés.

## Résultat automatisé

**151 tests réussis dans 18 fichiers**, build TypeScript/Vite réussi, `git diff --check` sans erreur. Tests nouveaux : réducteur, six fragments réels, ordre, transitions, maintien trop court/complet, souris, doigt simulé, Entrée/Espace, annulation, sortie tactile, focus, visibilité, doubles entrées, passage depuis neuf états, rejeu, rechargement pendant/après, retour mission, remise à zéro confirmée, mode réduit dynamique, son local, préférence et nettoyage.

Les 98 scénarios de référence sont conservés avec adaptation des seules attentes propres à l’ancienne finale. Le code attendu reste `472596`. Aucune dépendance ajoutée. Test d’absence d’URL distante dans les ressources d’exécution réussi. Cache porté à `abbadie-v11`, pré-cache JS/CSS/SVG et nettoyage des versions antérieures testés.

## Navigateur réel

Chrome local piloté par Playwright, navigateur intégré indisponible. `scripts/check-browser.mjs` a parcouru les six missions avec leurs contrôles réels, puis toute la finale **hors ligne après installation du service worker et rechargement** en 768×1024, 1024×768 et 390×844. Maintien tactile court puis complet, neuf étapes visuelles, code, trois actions, rejeu, retour mission, rechargement sans relance et parcours réduit vérifiés. Aucune erreur JavaScript ni requête distante.

Captures inspectées : obscurcissement, fragments, attente du geste, charge, montée en puissance, ouverture, constellation, illumination et bilan. Une superposition des modules et des plaques en paysage a été corrigée en réservant la hauteur intrinsèque de la machine. Le contrôle d’activation mesure 64 px. `scripts/check-finale-browser.mjs` vérifie les dix états aux deux tailles tablette avec horloge simulée, absence de chevauchement machine/plaques, absence de scrolling et visibilité des trois actions.

Captures reproductibles dans `/tmp/abbadia-browser-shots` et `/tmp/abbadia-finale-shots`, sans ajout aux assets du jeu. Les captures figent les effets CSS pour inspection ; le parcours complet exécute aussi les durées réelles.

## Reproduire

```sh
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4178
PLAYWRIGHT_MODULE=/tmp/abbadia-browser-check/node_modules/playwright/index.mjs \
BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
GAME_URL=http://127.0.0.1:4178 node scripts/check-browser.mjs
PLAYWRIGHT_MODULE=/tmp/abbadia-browser-check/node_modules/playwright/index.mjs \
BROWSER_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
GAME_URL=http://127.0.0.1:4178 node scripts/check-finale-browser.mjs
```

## À vérifier sur la tablette physique

Safari/iPadOS, safe areas avec barres réelles, installation sur écran d’accueil, fluidité du crescendo sur matériel moyen, confort du maintien et volume/qualité des sons. La synthèse audio est testée fonctionnellement, sans validation d’écoute sur haut-parleurs. L’agrandissement à 200 % reste à examiner séparément.

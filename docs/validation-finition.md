# Vérification de la finition — 16 septembre 2026

## Référence

Dépôt propre au départ, branche `main`, commit `5bf6f56`.
Suite de référence : 77 tests réussis dans 15 fichiers. Build TypeScript/Vite réussi.

## Validation automatique finale

97 tests dans 15 fichiers : règles et interactions des six missions, glisser-déposer et alternative sélection/dépôt, sauvegardes, indices, remises à zéro, accueil et trois niveaux, états de la machine, six révélations et fragments `472596`, finale automatique, blocage avant six fragments, animation complète/passée/réduite, carnet, rejeu, confirmation globale et clavier.

Le service worker est exécuté dans un environnement simulé : installation, ressources pré-cachées, rechargement des ressources sans réseau, repli de navigation et nettoyage des caches obsolètes. Les nouveaux fichiers sont vérifiés présents localement. Le test existant d’absence de ressources distantes est conservé.

Aucune dépendance ajoutée. Les moteurs, données de puzzles, classifieur et format de sauvegarde restent inchangés. Seul le libellé d’âge Expert est développé en « 12 ans et plus ».

## Limite de la session

Le runtime Browser a été initialisé, mais ne dispose d’aucun navigateur connecté (`No browser is available`, liste vide). L’application répond sur le serveur local, mais **aucune capture du jeu ni inspection de mise en page dans un navigateur n’a pu être effectuée**. La carte de partage PNG a été inspectée comme image ; ce n’est pas une validation de l’interface.

Les tests jsdom et du service worker ne prouvent pas le rendu réel, les tailles tactiles mesurées, le contraste de chaque détail, la fluidité sur tablette, ni l’installation PWA réelle.

## Parcours manuel à effectuer

À chaque dimension **768×1024** et **1024×768**, capturer et inspecter :

1. Accueil : château, titre, choix d’âge, bouton principal visible et navigation au clavier.
2. Laboratoire sans progression : six modules accessibles, connexion au cœur, états écrits.
3. Mission Composants : sélection, erreur, glisser-déposer tactile, placements verrouillés, aide et remise à zéro locale.
4. Révélation du fragment 4 : chiffre, transmission, texte pédagogique et retour au laboratoire.
5. Laboratoire partiellement complété : module allumé, emplacement 4, progression et reprise après rechargement.
6. Chacune des cinq autres missions, particulièrement la grille Programme, les voisins IA et la comparaison des jeux d’apprentissage.
7. Finale : code `472596` sans saisie, six activations, réveil et illumination ; version avec animation, animation passée et mouvement réduit.
8. Victoire et carnet : les trois actions, rejeu réellement vierge, annulation puis confirmation de « Nouvelle équipe ».

Reprendre les écrans 1–8 à **390×844**, puis contrôler le texte agrandi à 200 %. Vérifier l’absence de débordement horizontal, de recouvrement, de décor devant une valeur ou une pièce, de contrôle essentiel sous 44×44 px, ainsi que le focus visible.

Pour la PWA réelle : `npm run build`, puis `npm run preview`. Charger complètement en ligne, attendre l’activation de `abbadie-v9`, installer sur la tablette, couper le réseau, fermer et relancer l’application, recharger entièrement et terminer une mission. Vérifier le passage depuis une installation v8 en conservant la progression. Cette vérification reste à faire dans un vrai navigateur.

# Plan du prototype

## Parcours utilisateur

1. L'équipe découvre la machine arrêtée et lance la mission.
2. Elle choisit un niveau : Explorateur (6–8 ans), Scientifique (9–11 ans) ou Expert (12+).
3. Elle choisit librement l'un des six modules sur la carte.
4. Pour les six modules, elle joue directement à l’écran et chaque fragment est enregistré automatiquement.
5. Une réussite conserve le fragment, affiche l'idée pédagogique, puis ramène à la carte.
6. Après les six réussites, l'équipe saisit les fragments dans l'ordre imposé et redémarre la machine.
7. L'écran de victoire récapitule les notions et permet d'effacer la partie pour une nouvelle équipe.

## Écrans

- **Accueil** : titre, machine scientifique arrêtée, introduction et bouton de départ.
- **Choix du niveau** : trois cartes avec âge, ton et quantité d'aide annoncés.
- **Carte des missions** : six modules, état textuel et visuel, progression, accès libre et finale verrouillée/déverrouillée.
- **Mission** : mini-jeu tactile pour les six modules, y compris l’IA.
- **Activité IA** : découverte des exemples, classement de quatre observations, puis comparaison de jeux équilibré et déséquilibré avant le fragment 6.
- **Finale** : rappel ordonné des six fragments, saisie du code, redémarrage animé, victoire et nouvelle équipe.

## États du jeu

- `welcome`, `level`, `map`, `mission`, `finale`, `victory` pour la navigation.
- Niveau choisi : `explorer`, `scientist` ou `expert`.
- Par mission : `not-started`, `in-progress`, `completed`.
- Progression persistée : identifiant du niveau, missions validées, fragments, tentatives, indices et état détaillé de la mission IA.
- État transitoire non persisté : saisies, messages de formulaire et animation de réussite.

## Six missions

| Ordre final | Module | Manipulation physique | Fragment | Notion |
| --- | --- | --- | --- | --- |
| 1 | Composants | Associer quatre composants à leur fonction | 4 | Rôles complémentaires des composants |
| 2 | Programme | Ordonner des instructions sur une grille | 7 | Exécution exacte d'un programme |
| 3 | Mémoire | Trier mémoire de travail et stockage | 2 | RAM temporaire et stockage durable |
| 4 | Données | Composer et décoder une suite binaire | 5 | Information représentée par des nombres |
| 5 | Informatique partout | Construire « capteur → programme → action » | 9 | Informatique embarquée au quotidien |
| 6 | Intelligence artificielle | Classer des observations par ressemblance | 6 | Apprentissage par exemples et erreurs |

## Règles de validation

- Les réponses, contenus et indices sont centralisés dans `src/data/missions.ts`.
- L'application demande un seul chiffre mais ne le révèle jamais avant validation physique.
- Première erreur : message générique de nouvelle vérification.
- Deuxième erreur : premier indice automatiquement visible.
- Troisième erreur et suivantes : indice plus précis, sans chiffre ni solution.
- Le bouton d'indice révèle le prochain indice autorisé par le niveau ; Explorateur dispose de formulations plus guidées, Expert d'indices moins nombreux et moins directs.
- Une mission validée ne perd jamais son état au retour sur la carte.
- La finale n'est disponible que si les six missions sont validées et accepte uniquement la combinaison configurable `472596`.

## Adaptation par âge

- **Explorateur** : phrases courtes, vocabulaire concret, trois indices progressifs.
- **Scientifique** : vocabulaire scolaire, deux indices structurés.
- **Expert** : termes précis, deux indices plus synthétiques.
- Les manipulations, fragments et objectifs restent strictement identiques.

## Stratégie hors ligne

- Aucun backend, compte, CDN, média distant ou appel API.
- Build Vite entièrement autonome avec manifeste, icônes locales et service worker maison.
- Au premier chargement, le service worker pré-cache l'interface et les ressources construites ; les navigations utilisent le cache avec repli sur `index.html`.
- La progression est sérialisée dans `localStorage`, validée à la lecture et réinitialisable.
- Une mise à jour du nom de cache permet de remplacer proprement les anciennes ressources.

## Étapes d'implémentation

1. Créer ce plan et les consignes du dépôt.
2. Initialiser React, Vite et TypeScript avec une structure minimale.
3. Centraliser les données des missions et coder le modèle de progression.
4. Construire le parcours complet et l'activité IA locale déterministe.
5. Créer l'identité visuelle responsive avec CSS, formes et pictogrammes locaux remplaçables.
6. Ajouter manifeste, icônes, enregistrement et cache du service worker.
7. Documenter l'installation, le kit physique et les futurs assets.
8. Ajouter les tests unitaires et de parcours essentiels.
9. Lancer tests, vérification TypeScript et build de production.
10. Tester le parcours, la persistance, la remise à zéro, les erreurs/indices et le mode hors ligne aux formats 768×1024 et 1024×768, sans débordement ni erreur console.

## Critères de vérification

- Les six réponses justes/fausses suivent les règles et la finale se débloque exactement après six validations.
- La progression survit à un rechargement et une nouvelle équipe revient à un état vierge.
- Le classifieur donne des résultats déterministes et illustre un cas d'erreur/biais.
- Le build est sans erreur et le parcours reste jouable depuis le cache après un premier chargement.
- Tous les contrôles sont tactiles (48 px minimum), accessibles au clavier, lisibles et sans information portée uniquement par la couleur.
- Aucun défilement horizontal à 768×1024 et 1024×768 ; `prefers-reduced-motion` neutralise les animations.

## Évolution vers une version 100 % numérique

### Boucle d’interaction commune

Chaque futur mini-jeu suit la même boucle : découvrir une consigne courte, sélectionner ou déplacer un objet, tenter un dépôt dans une zone, recevoir un retour pédagogique, verrouiller les placements corrects, suivre une progression visible, puis déclencher automatiquement le fragment et l’animation de réussite. Un bouton remet le mini-jeu en cours à zéro tant qu’il n’est pas validé ; la remise à zéro complète de l’équipe reste l’unique moyen d’effacer un fragment acquis.

Le socle partagé sépare :

- les données du puzzle (objets, cibles, correspondances et textes par niveau) ;
- la logique pure de placement et de réussite ;
- le hook React qui gère sélection, déplacement, erreur, verrouillage et retour ;
- les composants accessibles d’objet manipulable et de zone de destination ;
- le décor propre à chaque mission.

### Comportement tactile et accessible

- Les interactions utilisent les Pointer Events pour unifier souris, stylet et doigt, sans bibliothèque supplémentaire.
- Un déplacement capture le pointeur, applique `touch-action: none` et empêche le défilement pendant le geste.
- Le dépôt peut toujours se faire sans glisser : toucher ou cliquer l’objet, puis toucher ou cliquer la cible.
- Un second toucher sur l’objet annule la sélection.
- Les cibles sont de vrais boutons HTML, disposent d’un état de focus visible, d’un libellé accessible et mesurent au moins 48 × 48 px.
- Les états sélectionné, déplacé, refusé et installé sont indiqués par du texte ou un symbole en plus de la couleur.
- Les animations sont courtes et neutralisées par `prefers-reduced-motion`.

### Migration progressive des six missions

1. **Composants — cette itération** : placement numérique complet des quatre pièces, apparition automatique du fragment 4 et persistance des placements.
2. **Programme — cette itération** : grille tactile, blocs ordonnables, moteur déterministe, exécution animée et fragment 7 automatique.
3. **Mémoire — cette itération** : tri tactile de cartes entre RAM et stockage, feedback par niveau et fragment 2 automatique.
4. **Données — cette itération** : interrupteurs-étoiles, calcul binaire local et fragment 5 automatique.
5. **Informatique partout — cette itération** : chaîne capteur-programme-action testable et fragment 9 automatique.
6. **Intelligence artificielle — cette itération** : classement tactile des observations et expériences de voisinage locales, fragment 6 automatique.

La migration numérique des six missions est achevée. Les visuels définitifs restent à produire.

### Architecture des assets

- `src/assets/game/components/` : objets interactifs temporaires puis SVG définitifs.
- `src/assets/game/backgrounds/` : décors narratifs WebP ou PNG.
- `src/assets/game/ui/` : éléments d’interface locaux et états de jeu.
- `src/assets/placeholders/` : éléments provisoires historiques.
- `.prompts/` : briefs et prompts de production graphique, jamais des dépendances d’exécution.
- `docs/assets-inventory.md` : inventaire, proportions, rôle et remplacement prévu.

Les visuels interactifs restent séparés des libellés HTML afin de préserver lisibilité, traduction et accessibilité. Aucun asset n’est chargé depuis un CDN.

### Entrées IoT futures

La logique de jeu est pensée autour d’événements `select`, `place` et `reset`. L’écran est le seul adaptateur de cette version. Une interface `MissionInputAdapter` pourra plus tard convertir une entrée matérielle en ces mêmes événements sans changer les règles du puzzle. Aucun Web Bluetooth, Web Serial, MQTT, réseau local ou code microcontrôleur n’est introduit avant validation du jeu entièrement tactile.

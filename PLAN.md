# Plan du prototype

## Parcours utilisateur

1. L'équipe découvre la machine arrêtée et lance la mission.
2. Elle choisit un niveau : Explorateur (6–8 ans), Scientifique (9–11 ans) ou Expert (12+).
3. Elle choisit librement l'un des six modules sur la carte.
4. Pour chaque module, elle réalise la manipulation avec le matériel physique, saisit le chiffre apparu et peut demander des indices progressifs.
5. Une réussite conserve le fragment, affiche l'idée pédagogique, puis ramène à la carte.
6. Après les six réussites, l'équipe saisit les fragments dans l'ordre imposé et redémarre la machine.
7. L'écran de victoire récapitule les notions et permet d'effacer la partie pour une nouvelle équipe.

## Écrans

- **Accueil** : titre, machine scientifique arrêtée, introduction et bouton de départ.
- **Choix du niveau** : trois cartes avec âge, ton et quantité d'aide annoncés.
- **Carte des missions** : six modules, état textuel et visuel, progression, accès libre et finale verrouillée/déverrouillée.
- **Mission** : contexte bref, consigne adaptée, illustration CSS temporaire, saisie numérique, validation, indices et retour.
- **Activité IA** : après la validation du module 6, classifieur local à exemples, cas clair puis cas ambigu/données déséquilibrées.
- **Finale** : rappel ordonné des six fragments, saisie du code, redémarrage animé, victoire et nouvelle équipe.

## États du jeu

- `welcome`, `level`, `map`, `mission`, `finale`, `victory` pour la navigation.
- Niveau choisi : `explorer`, `scientist` ou `expert`.
- Par mission : `not-started`, `in-progress`, `completed`.
- Progression persistée : identifiant du niveau, missions validées, fragments, tentatives, nombre d'indices révélés et activité IA terminée.
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

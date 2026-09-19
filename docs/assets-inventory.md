# Inventaire des assets — mission Composants

| Asset temporaire | Emplacement actuel | Proportion | Rôle | Remplacement définitif recommandé |
| --- | --- | --- | --- | --- |
| Silhouette processeur | CSS `.component-icon--chip` | Carré 1:1 | Reconnaître la puce et ses broches | SVG détouré, sans texte |
| Silhouette mémoire vive | CSS `.component-icon--memory` | Paysage 3:2 | Reconnaître une barrette et ses contacts | SVG détouré, sans texte |
| Silhouette stockage | CSS `.component-icon--disk` | Carré 1:1 | Évoquer un support persistant | SVG détouré, sans texte |
| Silhouette alimentation | CSS `.component-icon--battery` | Portrait 4:5 | Évoquer énergie et distribution | SVG détouré, sans texte |
| Cœur de machine | CSS `.component-machine` et pseudo-éléments | Paysage environ 4:3 | Porter les quatre zones, circuits et cadrans | Décor WebP/PNG avec calques calmes sous les zones |
| Circuits convergents | CSS `.machine-circuits` | Pleine largeur | Montrer l’activation progressive | SVG d’interface animé par CSS |
| Afficheur du fragment | HTML/CSS `.digital-fragment` | Portrait 4:5 | Faire apparaître le chiffre 4 après réussite | SVG d’interface à segments, pilotable par CSS |
| Étoiles et engrenages | CSS et caractères décoratifs masqués aux lecteurs d’écran | Variables | Renforcer l’univers scientifique | SVG d’interface local cohérent |

Les objets interactifs définitifs doivent être livrés en SVG optimisé. Les décors narratifs non interactifs seront de préférence en WebP, avec PNG si la transparence ou la compatibilité l’exige. Aucun texte ne doit être rasterisé dans les images.

## Mission Programme

| Asset | Rôle | Emplacement prévu | Proportion | Format conseillé | Temporaire actuel |
| --- | --- | --- | --- | --- | --- |
| Automate | Montrer position et orientation | Grille, calque interactif | Carré 1:1 | SVG interactif | Flèche HTML/CSS |
| Grille d’observatoire | Plateau de déplacement | Fond principal | Paysage 1:1 à 4:3 | SVG interactif | Grille CSS |
| Obstacles | Bloquer certaines cases | Cases de la grille | Carré 1:1 | SVG interactif | Glyphes et CSS |
| Blocs d’instructions | Construire le programme | Réserve et séquence | Paysage 3:1 | SVG d’interface + texte HTML | Boutons HTML/CSS |
| Télescope | Destination narrative | Case d’Orion | Portrait 2:3 | SVG interactif | Étoile CSS |
| Constellation d’Orion | Révéler la réussite | Calque sur la grille | Paysage 4:3 | SVG interactif | Caractères et lignes CSS |
| Animation du chiffre 7 | Révéler le fragment | Constellation | Carré 1:1 | SVG animé par CSS | Texte HTML/CSS |

## Mission Mémoire

| Asset | Rôle | Emplacement prévu | Proportion | Format conseillé | Temporaire actuel |
| --- | --- | --- | --- | --- | --- |
| Table de travail | Zone RAM | Destination gauche | Paysage 4:3 | Image de décor WebP + zone HTML | Panneau CSS |
| Bibliothèque | Zone stockage | Destination droite | Paysage 4:3 | Image de décor WebP + zone HTML | Rayonnage CSS |
| Cartes d’information | Objets à classer | Réserve | Paysage 3:2 | SVG interactif sans texte | Boutons HTML/CSS |
| Effets RAM | Activation rapide/volatile | Table et mécanisme | Bandeau 3:1 | SVG interactif | Lueur CSS |
| Effets de stockage | Remplissage des rayonnages | Bibliothèque | Portrait 2:3 | SVG interactif | Vignettes CSS |
| Animation du chiffre 2 | Révéler le fragment | Mécanisme central | Carré 1:1 | SVG animé par CSS | Texte HTML/CSS |

## Mission Données

| Asset | Rôle | Emplacement prévu | Proportion | Format conseillé | Temporaire actuel |
| --- | --- | --- | --- | --- | --- |
| Cadran binaire | Porter les quatre positions | Pupitre central | Paysage 4:1 | SVG interactif | Panneaux et cercles CSS |
| Étoiles allumées/éteintes | Représenter 1 et 0 | Chaque cadran | Carré 1:1 | SVG interactif | Glyphes ★ et ☆ |
| Poids 8, 4, 2, 1 | Donner la valeur de position | Haut des cadrans | Paysage 2:1 | Texte HTML associé au SVG | Libellés HTML |
| Circuit lumineux | Montrer les valeurs actives | Sous les cadrans | Paysage 4:1 | SVG interactif | Traits et lueurs CSS |
| Animation du fragment 5 | Transformer le total en fragment | Jauge finale | Carré 1:1 | SVG animé par CSS | Texte et jauge CSS |

## Mission Informatique partout

| Asset | Rôle | Emplacement prévu | Proportion | Format conseillé | Temporaire actuel |
| --- | --- | --- | --- | --- | --- |
| Capteur de luminosité | Mesurer la lumière | Carte et zone Capteur | Carré 1:1 | SVG interactif | Glyphe ◉ |
| Thermomètre | Alternative pédagogique | Réserve | Portrait 1:2 | SVG interactif | Glyphe ♨ |
| Miroir | Objet non informatisé | Réserve | Portrait 2:3 | SVG interactif | Glyphe ◇ |
| Câble | Transport électrique sans décision | Réserve | Paysage 3:1 | SVG interactif | Glyphe ⌁ |
| Bouton mécanique | Entrée humaine, non ambiante | Réserve | Carré 1:1 | SVG interactif | Cercle CSS |
| Engrenage | Mouvement sans programme | Réserve | Carré 1:1 | SVG interactif | Glyphe ⚙ |
| Règle programmée | Traiter la mesure | Zone Programme | Paysage 3:2 | SVG interactif + texte HTML | Carte HTML/CSS |
| Lampe commandée | Produire l’action | Zone Action | Portrait 2:3 | SVG interactif | Glyphe ✦ et halo CSS |
| Décor jour/nuit | Mettre en scène le test | Fond du laboratoire | Paysage 16:9 | Décor raster WebP | Dégradés et silhouette CSS |
| Flux de données | Montrer donnée et commande | Entre les trois zones | Paysage 4:1 | SVG interactif | Flèches et lueurs CSS |
| Animation du fragment 9 | Révéler le chiffre sur la paroi | Château éclairé | Portrait 2:3 | SVG animé par CSS | Texte et faisceau CSS |

## Mission Intelligence artificielle

| Asset | Rôle | Emplacement prévu | Proportion | Format conseillé | Temporaire actuel |
| --- | --- | --- | --- | --- | --- |
| Fond d’observatoire IA | Situer le laboratoire scientifique | Arrière-plan du graphique | Paysage 4:3 | Image de décor WebP | Dégradé CSS |
| Graphique céleste | Positionner luminosité et régularité | Plateau central | Carré 1:1 | SVG interactif avec axes HTML | Grille CSS et boutons HTML |
| Signal | Exemple de classe signal | Points et cartes | Carré 1:1 | SVG interactif sans texte | Glyphe ★ et CSS |
| Parasite | Exemple de classe parasite | Points et cartes | Carré 1:1 | SVG interactif sans texte | Glyphe ◆ et CSS |
| Observation inconnue | Distinguer le cas à classer | Point mobile du graphique | Carré 1:1 | SVG interactif sans texte | Glyphe ◎ et pulsation CSS |
| Lignes de distance | Expliquer les voisins sélectionnés | Calque du graphique | Ligne variable | SVG interactif | Traits CSS calculés |
| Vote des voisins | Montrer les trois votes | Panneau latéral | Paysage 3:1 | SVG interactif et texte HTML | Liste et symboles HTML |
| Indicateur d’équilibre des données | Comparer les proportions | Panneau expérience | Paysage 4:1 | SVG interactif | Compteurs ★ et ◆ en HTML |
| Levier de modification du jeu d’apprentissage | Déclencher le changement de données | Panneau expérience | Paysage 3:1 | SVG interactif | Bouton HTML |
| Animation du fragment 6 | Relier les observations au chiffre | Conclusion | Carré 1:1 | SVG animé par CSS | Cartes O1–O4 et chiffre HTML/CSS |

## Finition commune — septembre 2026

Ces éléments remplacent la présentation provisoire de l’accueil et de la carte. Les objets manipulables des six missions conservent leur géométrie et leurs textes.

| Asset créé | Format | Emplacement | Fonction / cache |
| --- | --- | --- | --- |
| Château-observatoire nocturne original | SVG, 800×700, ~3 Ko | `public/assets/abbadia-night.svg` | Accueil, illumination finale et victoire ; pré-cache explicite |
| Gardien mécanique à six expressions | SVG React | `src/components/Observatory.tsx`, `GuideCharacter` | Même guide dans les six missions ; inclus dans le JS pré-caché |
| Six icônes scientifiques | SVG React 48×48 | `src/components/Observatory.tsx`, `ModuleIcon` | Identification des modules et en-têtes ; inclus dans le JS |
| Astrolabe, connexions et modules | HTML/CSS | `MachineCore`, `CentralMachine`, `src/observatory.css` | Machine endormie/active, six états de progression ; JS/CSS pré-cachés |
| Plaques de fragments et transmission | HTML/CSS | `FragmentCollection`, `FragmentReveal`, `CompletionPanel` | Chiffres lisibles, transfert court et sauvegarde ; JS/CSS pré-cachés |
| Carte de partage originale | PNG, largeur 1200 px, ~1,3 Mo | `public/og.png` | Métadonnées de partage uniquement ; cache explicite, aucun rôle pédagogique |

Aucune police distante, bibliothèque graphique ou image externe. Les SVG React ne nécessitent pas de requête supplémentaire. Le prompt de la carte de partage se trouve dans `.prompts/social-preview.md`. Les titres, consignes, états et chiffres restent en HTML dans tout le parcours.

## Le Réveil d’Abbadia

- Machine, astrolabe, icônes, gardien et château existants réutilisés sans modification.
- `src/finale/Finale.tsx` : constellation à six étoiles et surcouche SVG de quatre fenêtres et connexions ; incluses dans le JavaScript pré-caché.
- `src/finale/finale.css` : arche ouvrante, faisceau cyan/or, insertion des plaques, six effets distincts et pulsation lente ; inclus dans le CSS pré-caché.
- `src/finale/audio.ts` : synthèse Web Audio locale ; aucun média à télécharger.
- Aucun raster ni ressource distante ajouté. Cache `abbadie-v11`.

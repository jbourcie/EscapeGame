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

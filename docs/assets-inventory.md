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

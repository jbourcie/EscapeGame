# Direction visuelle — Le Mystère de la Machine d’Abbadia

## Identité réalisée

Laboratoire scientifique néogothique, entre océan et étoiles. Le château SVG est une composition originale, sans reprise d’une photo ni d’un plan d’Abbadia. Le laboratoire mêle optique ancienne et informatique : un astrolabe central reçoit six plaques de cuivre chiffrées.

- Bleu profond `#081b2b`, panneaux `#102b3e`, ivoire `#faf3e5`.
- Cuivre/or vieilli `#ac8251` / `#e6c28c`, cyan/turquoise `#8ce4d7` pour l’énergie et la réussite.
- Erreurs : rouge chaud `#ffc0a8`, symbole et explication textuelle.
- Titres en Georgia locale ; consignes et contrôles en Arial/sans-serif locale.
- Les symboles de chaque mission gardent une teinte secondaire et une forme distincte. Les états sont également écrits : disponible, en cours, terminée et sélectionnée.
- Guide unique : petit instrument astronomique vivant, anneau de cuivre, visage cyan. Six expressions avec la même silhouette, sans multiplication des personnages.
- Arches et ciel dans le décor ; surfaces pédagogiques calmes et opaques. Pas de texte de jeu incorporé aux images.
- Interactions : contrôles de 48 px, focus cyan explicite, toucher ou glisser, sans effet indispensable au survol.
- Animations courtes : transmission d’une plaque, mise en lumière des connexions puis du château. Désactivation locale et système ; aucun confetti.

## Assets et mise en œuvre

Le château est dans `public/assets/abbadia-night.svg`. Le guide et les icônes sont des SVG structurés dans `src/components/Observatory.tsx` ; la machine et ses connexions sont en HTML/CSS. Les variantes utilisent le même asset. Les textes essentiels, chiffres et états restent du HTML.

La carte `public/og.png` est réservée au partage externe, sans rôle dans les consignes. Son prompt est archivé dans `.prompts/social-preview.md`.

## Évolution éventuelle du décor

Validation du 19 septembre : réserver une place distincte aux légendes et aux poids binaires ; aucun décor ne doit intercepter les touchers. Sur tablette, garder les réserves proches des destinations et réduire la hauteur de la machine centrale. Sur mobile, placer l’entrée dans le laboratoire avant l’illustration. Les réussites reçoivent le focus ; le château final remplace la machine dans la scène.

Aucun raster n’est nécessaire au jeu actuel. Si une illustration plus riche est souhaitée : produire un WebP 1200×1050, moins de 300 Ko, reprenant l’arche, le château nocturne imaginaire, l’océan et la fenêtre lumineuse. Laisser la partie basse centrale calme pour la machine HTML. Aucun logo, personnage supplémentaire, mot ni chiffre. Conserver le SVG comme repli léger et ajouter tout remplacement au pré-cache.

## Finale — Le Réveil d’Abbadia

Conserver le laboratoire et le château existants. Crescendo de 32 secondes : obscurcissement, six plaques de cuivre, geste de l’enfant, cœur cyan/or, arche astronomique, constellation chiffrée, fenêtres éclairées et circuits. Effets différenciés par système ; aucune lumière blanche plein écran, flash rapide ou confetti. Le bilan redevient calme. SVG et CSS locaux uniquement ; aucune génération supplémentaire nécessaire. Tous les effets sont supprimés en mouvement réduit, avec succession explicite des états.

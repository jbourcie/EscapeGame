# Le Réveil d’Abbadia

La finale intervient uniquement au retour de la dernière réussite : son panneau pédagogique et son fragment restent visibles jusqu’à l’action de retour au laboratoire. `finaleCode` exige les six missions terminées et leurs six vrais fragments ; il les assemble dans l’ordre de `missions`, puis vérifie `finalCode`. Aucune copie indépendante du code n’est utilisée à l’exécution.

## Machine à états

`src/finale/machine.ts` contient le réducteur pur, les événements typés et les durées. `Finale.tsx` gère les entrées, le focus, les timers et la présentation. Aucune transition ne dépend de `animationend`.

| État | Sortie normale | Information / effet |
| --- | --- | --- |
| idle | 1,2 s | Six fragments réunis, gardien surpris |
| dimming | 2,8 s | Obscurcissement du laboratoire |
| fragments | 6 × 1 s | Insertion ordonnée ; châssis, engrenage, mémoire, binaire, connexions, lentille |
| ready | Action de l’enfant | Six systèmes prêts, contrôle tactile et alternative |
| charging | Maintien de 2 s | Jauge, flux vers le cœur, anneaux accélérés |
| awakening | 5 s | Énergie maximale et pulsation lente |
| observatory | 5 s | Ouverture de l’arche, ciel, faisceau, château existant |
| constellation | 5 s | Six étoiles, liaisons et code lisible |
| illuminated | 5 s | Fenêtres successives, circuits et cœur lumineux |
| summary | Action volontaire | Six découvertes et trois actions principales |

Durée de 32 secondes avec un maintien réussi, hors attente au contrôle et lecture du bilan. `NEXT` n’active jamais le contrôle à la place de l’enfant. `HOLD`, `CHARGE`, `RELEASE` et `ACTIVATE` sont ignorés hors de leurs états respectifs. `SKIP` arrive immédiatement au bilan complet depuis toute phase. `REPLAY` réinitialise uniquement la cinématique.

## Interaction et accessibilité

Un bouton HTML de 64 px accepte le doigt, la souris, Entrée ou Espace. Un seul identifiant de pointeur/touche peut posséder le maintien. Relâchement, `pointercancel`, sortie (y compris capture tactile implicite), perte de capture, perte du focus ou masquage de la page annulent la charge. Le guide encourage simplement à recommencer. La jauge revient à zéro en douceur. « Activer sans maintien » est disponible pour tous les utilisateurs.

Avec la préférence système ou « Animations : non », les mouvements sont supprimés et chaque phase automatique avance par « Continuer le réveil », sans attente. Les six insertions restent distinctes. « Passer » fonctionne aussi dans ce mode. Les annonces utilisent un statut textuel ; la jauge dispose d’une valeur accessible. Focus sur l’activation lorsqu’elle devient disponible et sur le titre du bilan à l’arrivée.

## Progression et navigation

Aucune modification du schéma ou des fonctions de sauvegarde. La cinématique ne reçoit aucun setter de progression. Un rechargement revient à l’accueil existant, puis au laboratoire : le réveil n’est jamais relancé automatiquement. L’équipe peut le lancer volontairement depuis la machine. Un verrou de session évite les relances automatiques après de nouveaux retours au laboratoire.

« Rejouer le réveil » ne touche à aucune mission. « Revoir une mission » retrouve le mode d’entraînement existant, transitoire. « Accueillir une nouvelle équipe » appelle la confirmation et la remise à zéro globale existantes, puis l’accueil avec les trois niveaux.

## Audio facultatif

`audio.ts` synthétise uniquement des sinus locaux, à faible gain : insertion, montée de charge, impulsion et accord final. Son coupé par défaut, préférence `abbadia-sound` séparée de la progression. Aucun AudioContext avant un geste sur le son ou l’activation ; une préférence activée ne lance donc pas de son automatiquement après rechargement. Les insertions sont sonorisées seulement si le contexte a déjà été initialisé par l’utilisateur. Web Audio absent/refusé n’interrompt jamais la finale.

À la sortie, à « Passer », au rejeu ou à la coupure du son : arrêt des oscillateurs et fermeture du contexte. Les timers et écouteurs sont nettoyés au démontage ; aucun timer de cinématique au bilan. Aucun fichier audio, bibliothèque ou accès réseau ajouté.

## Visuels et maintenance

Styles entièrement limités à `.awakening` et `.screen-finale` ; les styles des missions et les corrections tablette existantes restent inchangés. Réutilisation de `CentralMachine`, `MachineCore`, `ModuleIcon`, `GuideCharacter` et `abbadia-night.svg`. Les ajouts SVG inline dessinent seulement la constellation, les connexions et les fenêtres, superposées au château existant ; pas de nouvelle illustration distante.

Viewport dynamique et safe areas pour les deux tablettes cibles. Le bilan peut défiler sur petit mobile ; la cinématique et le bilan tiennent dans les deux formats tablette. Les préférences de mouvement sont observées en direct. Modifier les durées dans `machine.ts`, les effets locaux dans `finale.css`, puis relancer les tests et `scripts/check-browser.mjs`.

Cache PWA `abbadie-v11` : scripts et styles construits pré-cachés, château existant conservé, aucun nouvel asset externe.

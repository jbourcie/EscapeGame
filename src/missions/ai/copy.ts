import type { Level } from '../../data/missions';
import type { Observation } from '../../game/classifier';

export type GuidedStep = 1 | 2 | 3 | 4;

type StepCopy = { title: string; guide: string; instruction: string; help: [string, string, string] };

export const stepCopy: Record<Level, Record<GuidedStep, StepCopy>> = {
  explorer: {
    1: { title: 'Deux familles dans le ciel', guide: 'Avant de répondre, notre petite IA doit observer des exemples déjà classés. Une étoile montre un signal intéressant ; une forme irrégulière montre un parasite.', instruction: 'Touche les deux exemples, un dans chaque famille.', help: ['Cherche la carte étoile et la carte en forme de losange.', 'Touche chaque carte pour voir si elle brille beaucoup et si son rythme est régulier.', 'Commence par l’étoile à gauche, puis touche le parasite à droite.'] },
    2: { title: 'Comment compare-t-elle ?', guide: 'Voici une nouvelle lumière. La petite IA ne connaît pas encore sa famille. Regardons comment elle compare.', instruction: 'Touche « Voir la comparaison », puis avance image par image.', help: ['La lumière inconnue est le cercle ◎.', 'Appuie sur le grand bouton pour voir chaque petite étape.', 'Regarde ensuite les exemples entourés : ce sont les plus proches.'] },
    3: { title: 'À toi de lui montrer', guide: 'À ton tour de ranger une lumière dans sa famille. Après chaque choix, elle rejoint les exemples connus de la machine.', instruction: 'Observe la carte, puis touche une famille ou glisse la carte dessus.', help: ['Regarde si la lumière brille peu ou beaucoup, puis si son rythme est régulier.', 'Touche la carte ◎, puis la famille ★ ou ◆.', 'Compare-la aux exemples déjà rangés sur le dessin.'] },
    4: { title: 'Deux machines, deux réponses', guide: 'Les deux machines utilisent la même méthode. Mais l’une a vu des exemples variés et l’autre presque seulement des parasites.', instruction: 'Choisis d’abord la machine aux exemples les plus variés.', help: ['Compte les étoiles et les losanges de chaque machine.', 'Une machine a autant d’exemples des deux familles.', 'Choisis celle qui montre deux étoiles et deux parasites.'] },
  },
  scientist: {
    1: { title: 'Deux familles dans le ciel', guide: 'Avant de répondre, notre petite IA observe des exemples déjà classés. Un signal intéressant est généralement lumineux et régulier ; un parasite est souvent plus faible ou irrégulier.', instruction: 'Touche un exemple de chaque famille.', help: ['Observe l’étoile et le losange.', 'Compare les barres de luminosité et de régularité.', 'Touche les deux cartes pour connaître leurs valeurs.'] },
    2: { title: 'Une comparaison guidée', guide: 'Voici une nouvelle observation. L’IA ne connaît pas encore sa famille : elle va la comparer aux exemples connus.', instruction: 'Lance la comparaison et avance à ton rythme.', help: ['Le cercle ◎ représente l’observation inconnue.', 'Les traits montrent les ressemblances avec les exemples.', 'Les exemples entourés donnent chacun une voix à leur famille.'] },
    3: { title: 'Entraîne la petite IA', guide: 'Classe une observation à la fois. Une fois bien rangée, elle rejoint les données d’apprentissage pour les suivantes.', instruction: 'Sélectionne la carte, puis touche sa famille ; tu peux aussi la glisser.', help: ['Compare les deux caractéristiques : luminosité et régularité.', 'Touche la carte, puis la zone SIGNAL ou PARASITE.', 'Observe les exemples déjà connus et cherche la famille la plus ressemblante.'] },
    4: { title: 'Quand les exemples trompent', guide: 'Les deux IA utilisent la même méthode, mais leurs données d’apprentissage sont différentes. L’une possède un jeu équilibré, l’autre beaucoup plus de parasites.', instruction: 'Choisis la machine qui a les exemples les plus équilibrés.', help: ['Regarde le nombre de signaux et de parasites.', 'Un jeu équilibré contient les deux familles en nombre proche.', 'Choisis la machine avec deux signaux et deux parasites.'] },
  },
  expert: {
    1: { title: 'Deux familles dans le ciel', guide: 'Notre simulation commence avec des exemples étiquetés. Luminosité et régularité sont les deux caractéristiques numériques que le programme compare.', instruction: 'Inspecte un exemple de chaque classe.', help: ['Les formes distinguent les classes, même sans couleur.', 'Ouvre une carte pour voir son couple de valeurs.', 'Compare Signal A (8, 9) et Parasite A (3, 2).'] },
    2: { title: 'Une prédiction expliquée', guide: 'Cette petite IA utilise trois voisins proches pour proposer une classe. La prédiction ne prouve pas la vraie nature de l’observation.', instruction: 'Déroule la comparaison, puis réponds à la question.', help: ['Suis le cercle ◎ sur le graphique.', 'Les traits relient l’observation aux voisins retenus.', 'La classe majoritaire parmi ces voisins devient la prédiction.'] },
    3: { title: 'Entraîne et teste', guide: 'Classe les observations une par une. Les exemples correctement étiquetés rejoignent le jeu d’apprentissage avant le test suivant.', instruction: 'Classe l’observation affichée dans la bonne famille.', help: ['Compare les deux caractéristiques, pas seulement la luminosité.', 'Sélectionne puis dépose, ou fais glisser la carte.', 'Pour les curieux, ouvre le détail facultatif des distances.'] },
    4: { title: 'Mêmes règles, autres données', guide: 'La méthode de classification reste identique. Un jeu d’apprentissage déséquilibré peut cependant modifier la classe majoritaire des voisins.', instruction: 'Repère la machine dont les classes sont équilibrées.', help: ['Compare les effectifs des deux classes.', 'Une répartition 2–2 est plus équilibrée que 1–4.', 'Choisis l’IA avec deux signaux et deux parasites.'] },
  },
};

export function readableAmount(value: number): string {
  return value >= 7 ? 'beaucoup' : value >= 4 ? 'moyen' : 'peu';
}

export function describeKnownExample(item: Observation, level: Level): string {
  const family = item.label === 'signal' ? 'signal intéressant' : 'parasite';
  const rhythm = item.regularity >= 7 ? 'très régulier' : 'irrégulier';
  if (level === 'explorer') {
    return `${item.name} brille ${readableAmount(item.brightness)} et son rythme est ${rhythm}. On l’a rangé dans la famille des ${item.label === 'signal' ? 'signaux intéressants' : 'parasites'}.`;
  }
  if (level === 'scientist') {
    return `${item.name} : luminosité ${item.brightness}/10 et régularité ${item.regularity}/10. Cet exemple est déjà classé comme ${family}.`;
  }
  return `${item.name} a pour caractéristiques (${item.brightness}, ${item.regularity}). Sa classe connue est « ${family} » : la machine utilisera ces deux valeurs pour les comparaisons.`;
}

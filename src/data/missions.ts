export type Level = 'explorer' | 'scientist' | 'expert';

export type Mission = {
  id: string;
  order: number;
  shortTitle: string;
  title: string;
  icon: string;
  answer: string;
  situation: string;
  instructions: Record<Level, string>;
  hints: Record<Level, string[]>;
  learning: string;
  physicalAction: string;
  visual: 'gears' | 'path' | 'memory' | 'binary' | 'sensor' | 'ai';
};

export const levels: { id: Level; name: string; age: string; description: string; symbol: string }[] = [
  { id: 'explorer', name: 'Explorateur', age: '6 à 8 ans', description: 'Des mots simples et davantage de petits coups de pouce.', symbol: '✦' },
  { id: 'scientist', name: 'Scientifique', age: '9 à 11 ans', description: 'Des consignes précises et des indices équilibrés.', symbol: '⌁' },
  { id: 'expert', name: 'Expert', age: '12 ans et +', description: 'Le vocabulaire des scientifiques et moins d’indices.', symbol: '⌬' },
];

export const missions: Mission[] = [
  {
    id: 'components', order: 1, shortTitle: 'Composants', title: 'Réparer le cerveau de la machine', icon: '⚙', answer: '4', visual: 'gears',
    situation: 'Le cœur mécanique s’est dispersé. Chaque pièce doit retrouver sa fonction pour que l’énergie circule.',
    physicalAction: 'Sur le plateau, associe processeur, mémoire vive, stockage et alimentation à leur fonction.',
    instructions: {
      explorer: 'Place chaque pièce sur le dessin qui explique son travail. Quand tout est juste, regarde le chiffre formé.',
      scientist: 'Associe les quatre composants à leur rôle sur la carte mère. Les fragments alignés révéleront un chiffre.',
      expert: 'Rétablis l’architecture de la machine en reliant chaque composant à sa fonction, puis relève le chiffre de contrôle.',
    },
    hints: {
      explorer: ['Le processeur est la pièce qui calcule.', 'La mémoire vive garde ce qui sert maintenant ; le stockage garde longtemps.', 'L’alimentation apporte l’énergie aux autres pièces.'],
      scientist: ['Commence par distinguer calcul, travail temporaire, conservation et énergie.', 'La RAM est temporaire ; le disque ou la mémoire flash conserve les données.'],
      expert: ['Classe les rôles par calcul, volatilité, persistance et fourniture électrique.', 'Vérifie surtout la différence entre mémoire vive et stockage.'],
    },
    learning: 'Un ordinateur réunit plusieurs composants : chacun remplit une fonction différente.',
  },
  {
    id: 'program', order: 2, shortTitle: 'Programme', title: 'Donner des instructions au processeur', icon: '⌁', answer: '7', visual: 'path',
    situation: 'L’automate a oublié le chemin du télescope. Il suivra les cartes dans leur ordre exact, sans rien deviner.',
    physicalAction: 'Ordonne les cartes « avancer », « tourner » et, si elle est présente, « répéter » sur la grille.',
    instructions: {
      explorer: 'Pose les cartes pour guider le petit automate jusqu’au télescope. Suis-les une par une, puis lis sa case d’arrivée.',
      scientist: 'Construis le programme qui mène l’automate au télescope. Exécute chaque instruction dans l’ordre.',
      expert: 'Compose puis simule la séquence d’instructions, en utilisant la boucle si elle est disponible. Relève la sortie obtenue.',
    },
    hints: {
      explorer: ['Tourne d’abord l’automate dans le bon sens.', 'Après chaque carte, déplace vraiment le pion.', 'Une carte « répéter » permet de refaire plusieurs fois le même geste.'],
      scientist: ['Observe l’orientation du pion avant chaque déplacement.', 'Exécute le programme sans sauter ni corriger une instruction.'],
      expert: ['Trace l’état position-orientation après chaque instruction.', 'Une boucle répète son bloc exactement, y compris une éventuelle erreur.'],
    },
    learning: 'Un processeur exécute précisément les instructions d’un programme. Il ne devine pas notre intention.',
  },
  {
    id: 'memory', order: 3, shortTitle: 'Mémoire', title: 'Retrouver la mémoire d’Antoine', icon: '▤', answer: '2', visual: 'memory',
    situation: 'Les notes du savant sont mélangées. Certaines servent sur l’établi, d’autres doivent rester dans la bibliothèque.',
    physicalAction: 'Classe les cartes entre mémoire de travail et bibliothèque de stockage.',
    instructions: {
      explorer: 'Mets ce qui sert tout de suite sur la table, et ce qui doit rester longtemps dans la bibliothèque. Retourne les cartes.',
      scientist: 'Trie les cartes entre mémoire vive, utilisée pendant le travail, et stockage durable. Le verso formera un chiffre.',
      expert: 'Distingue les données volatiles de la session en cours des données persistantes, puis contrôle le motif au verso.',
    },
    hints: {
      explorer: ['Un calcul en train de se faire reste sur la table de travail.', 'Une photo gardée après l’arrêt va dans la bibliothèque.', 'Demande-toi : est-ce encore là quand la machine s’éteint ?'],
      scientist: ['La mémoire vive se vide quand la machine s’éteint.', 'Les fichiers enregistrés appartiennent au stockage.'],
      expert: ['Le critère décisif est la persistance hors alimentation.', 'Ne confonds pas vitesse d’accès et conservation durable.'],
    },
    learning: 'La mémoire vive sert au travail en cours. Le stockage conserve les informations après l’arrêt.',
  },
  {
    id: 'data', order: 4, shortTitle: 'Données', title: 'Décoder le ciel binaire', icon: '✦', answer: '5', visual: 'binary',
    situation: 'Le ciel parle à la machine avec seulement deux états : étoile éteinte ou étoile allumée.',
    physicalAction: 'Place les étoiles allumées et éteintes selon la carte-code, puis décode la suite binaire.',
    instructions: {
      explorer: 'Reproduis la rangée d’étoiles. Compte les valeurs des étoiles allumées pour découvrir le chiffre.',
      scientist: 'Compose la suite de 0 et de 1 indiquée, puis additionne la valeur des positions allumées.',
      expert: 'Décode le mot binaire construit avec les cartes, du bit de poids fort au bit de poids faible.',
    },
    hints: {
      explorer: ['Une étoile allumée vaut 1, une étoile éteinte vaut 0.', 'Utilise les valeurs écrites sous les étoiles allumées.', 'Additionne seulement les valeurs des étoiles qui brillent.'],
      scientist: ['Lis les positions dans le sens indiqué par la flèche.', 'Seules les positions portant un 1 contribuent au total.'],
      expert: ['Vérifie l’ordre des poids binaires avant la conversion.', 'Calcule la somme des puissances de deux dont le bit vaut 1.'],
    },
    learning: 'Les ordinateurs représentent textes, images, sons et mesures sous forme de nombres.',
  },
  {
    id: 'everywhere', order: 5, shortTitle: 'Informatique partout', title: 'Retrouver l’informatique invisible', icon: '◉', answer: '9', visual: 'sensor',
    situation: 'Autour du château, des objets observent et réagissent en silence. Retrouve ceux qui cachent un système informatique.',
    physicalAction: 'Choisis les objets informatisés et reconstruis une chaîne « capteur → programme → action ».',
    instructions: {
      explorer: 'Trouve ce qui observe, ce qui décide et ce qui agit. Aligne les bonnes cartes puis retourne-les.',
      scientist: 'Identifie les objets programmés et forme une chaîne complète : capteur, programme, action.',
      expert: 'Repère les systèmes embarqués et reconstruis leur boucle acquisition, traitement, commande.',
    },
    hints: {
      explorer: ['Le capteur remarque quelque chose, comme la lumière ou la chaleur.', 'Le programme décide quoi faire.', 'L’action peut allumer, sonner ou faire bouger.'],
      scientist: ['Cherche d’abord l’objet qui mesure son environnement.', 'La décision calculée doit conduire à une action observable.'],
      expert: ['Isole acquisition, traitement puis actionnement.', 'Un objet électrique n’est pas forcément programmable.'],
    },
    learning: 'L’informatique est présente dans de nombreux objets : elle observe, calcule, communique et commande une action.',
  },
  {
    id: 'ai', order: 6, shortTitle: 'Intelligence artificielle', title: 'Apprendre à la machine à observer le ciel', icon: '⌬', answer: '6', visual: 'ai',
    situation: 'La machine apprend à reconnaître les signaux grâce aux observations déjà classées. Mais de mauvais exemples peuvent la tromper.',
    physicalAction: 'Compare les nouvelles observations aux cartes déjà étiquetées « signal » ou « parasite », puis classe-les.',
    instructions: {
      explorer: 'Range chaque nouvelle observation avec les exemples qui lui ressemblent. Retourne les cartes bien classées.',
      scientist: 'Classe les observations par ressemblance avec les exemples étiquetés, puis lis le motif obtenu.',
      expert: 'Utilise le jeu d’apprentissage pour classifier les observations inconnues par similarité et relève le chiffre de contrôle.',
    },
    hints: {
      explorer: ['Compare la forme et la lumière de chaque carte.', 'Une carte peut ressembler davantage au groupe « signal » ou au groupe « parasite ».', 'Vérifie les cartes qui ne ressemblent parfaitement à aucun groupe.'],
      scientist: ['Compare plusieurs caractéristiques, pas seulement la couleur.', 'Les exemples proches doivent guider le classement, surtout pour les cas limites.'],
      expert: ['Raisonne en distance entre caractéristiques observées.', 'Un jeu d’exemples déséquilibré peut attirer la décision vers la classe majoritaire.'],
    },
    learning: 'Une intelligence artificielle apprend à partir d’exemples. Avec des données insuffisantes ou déséquilibrées, elle peut se tromper.',
  },
];

export const finalCode = missions.map((mission) => mission.answer).join('');

export const getMission = (id: string) => missions.find((mission) => mission.id === id);

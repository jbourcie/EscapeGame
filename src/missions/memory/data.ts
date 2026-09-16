import type { Level } from '../../data/missions';

export type MemoryKind = 'ram' | 'storage';
export type MemoryCard = { id: string; kind: MemoryKind; icon: string; title: string; descriptions: Record<Level, string>; expert?: boolean };
export const memoryCards: MemoryCard[] = [
  { id:'calculation', kind:'ram', icon:'∑', title:'Calcul en cours', descriptions:{ explorer:'La machine calcule maintenant.', scientist:'Résultat intermédiaire utilisé maintenant.', expert:'État de calcul volatile de la session.' } },
  { id:'tab', kind:'ram', icon:'▣', title:'Onglet actuellement ouvert', descriptions:{ explorer:'Une page utilisée maintenant.', scientist:'Page active chargée pour le travail.', expert:'État actif maintenu en mémoire volatile.' } },
  { id:'robot', kind:'ram', icon:'⌖', title:'Position actuelle de l’automate', descriptions:{ explorer:'L’endroit où il se trouve maintenant.', scientist:'État courant pendant l’exécution.', expert:'État d’exécution volatile du processus.' } },
  { id:'editing', kind:'ram', icon:'✎', title:'Image modifiée non enregistrée', descriptions:{ explorer:'Un dessin changé mais pas encore gardé.', scientist:'Modifications actives non sauvegardées.', expert:'Document modifié dans le tampon, sans persistance.' } },
  { id:'photo', kind:'storage', icon:'▧', title:'Photographie enregistrée', descriptions:{ explorer:'Une photo gardée pour demain.', scientist:'Fichier sauvegardé après la prise de vue.', expert:'Fichier persistant écrit sur le stockage.' } },
  { id:'notebook', kind:'storage', icon:'▤', title:'Carnet scientifique sauvegardé', descriptions:{ explorer:'Des notes rangées pour plus tard.', scientist:'Document sauvegardé durablement.', expert:'Document persistant sérialisé sur le disque.' } },
  { id:'map', kind:'storage', icon:'◇', title:'Carte téléchargée', descriptions:{ explorer:'Une carte gardée dans la machine.', scientist:'Fichier conservé après le téléchargement.', expert:'Ressource persistante disponible hors session.' } },
  { id:'archive', kind:'storage', icon:'▥', title:'Archive d’observations', descriptions:{ explorer:'De vieilles observations bien rangées.', scientist:'Collection enregistrée pour plus tard.', expert:'Archive persistante conservée hors alimentation.' } },
  { id:'installed-app', kind:'storage', icon:'⌘', title:'Application installée', descriptions:{ explorer:'Un outil gardé dans la machine.', scientist:'Le programme installé reste après l’arrêt.', expert:'Le binaire est persistant ; son exécution utilise aussi la RAM.' }, expert:true },
  { id:'running-app', kind:'ram', icon:'◉', title:'Application en cours d’exécution', descriptions:{ explorer:'Un outil qui travaille maintenant.', scientist:'Son état actuel existe pendant son exécution.', expert:'Le processus actif et son état sont volatils, contrairement au programme installé.' }, expert:true },
];
export const memoryCardsForLevel = (level: Level) => level === 'explorer' ? memoryCards.filter(({id}) => ['calculation','tab','robot','photo','notebook','map'].includes(id)) : level === 'expert' ? memoryCards : memoryCards.filter((card) => !card.expert);
export const memoryRulesForLevel = (level: Level) => Object.fromEntries(memoryCardsForLevel(level).map((card) => [card.id, card.kind]));
export const memoryFeedback = (level: Level, card: MemoryCard) => level === 'explorer'
  ? card.kind === 'ram' ? 'Cette information sert encore maintenant. Que se passerait-il si la machine s’éteignait ?' : 'Ce fichier a été enregistré : il doit pouvoir être retrouvé demain.'
  : level === 'expert' ? 'Ne confonds pas le programme persistant avec son état d’exécution volatile.' : 'Ne confonds pas rapidité d’accès et conservation durable.';

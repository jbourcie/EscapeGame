import type { Level } from '../../data/missions';

export type ComponentId = 'processor' | 'ram' | 'storage' | 'power';
export type ComponentTargetId = 'compute' | 'temporary' | 'persistent' | 'energy';

export type ComponentDefinition = {
  id: ComponentId;
  name: string;
  targetId: ComponentTargetId;
  visual: 'chip' | 'memory' | 'disk' | 'battery';
  roles: Record<Level, string>;
  installedFeedback: Record<Level, string>;
};

export type ComponentTarget = {
  id: ComponentTargetId;
  marker: string;
  needs: Record<Level, string>;
};

export const componentDefinitions: ComponentDefinition[] = [
  {
    id: 'processor', name: 'Processeur', targetId: 'compute', visual: 'chip',
    roles: { explorer: 'Il fait les calculs.', scientist: 'Il exécute les instructions du programme.', expert: 'Il traite les instructions et coordonne les opérations.' },
    installedFeedback: { explorer: 'Bravo ! Le processeur peut maintenant calculer.', scientist: 'Le processeur rejoint le circuit de calcul.', expert: 'L’unité de traitement répond au besoin d’exécution.' },
  },
  {
    id: 'ram', name: 'Mémoire vive', targetId: 'temporary', visual: 'memory',
    roles: { explorer: 'Elle garde ce qui sert maintenant.', scientist: 'Elle garde temporairement le travail en cours.', expert: 'Elle conserve rapidement les données volatiles de la session.' },
    installedFeedback: { explorer: 'Bien vu ! La mémoire vive garde le travail en cours.', scientist: 'La mémoire vive alimente l’espace de travail temporaire.', expert: 'La mémoire volatile répond au besoin d’accès temporaire.' },
  },
  {
    id: 'storage', name: 'Stockage', targetId: 'persistent', visual: 'disk',
    roles: { explorer: 'Il garde les fichiers même après l’arrêt.', scientist: 'Il conserve durablement les fichiers enregistrés.', expert: 'Il assure la persistance des données hors alimentation.' },
    installedFeedback: { explorer: 'Exact ! Les fichiers resteront après l’arrêt.', scientist: 'Le stockage rejoint le circuit de conservation durable.', expert: 'Le support persistant répond à la conservation hors tension.' },
  },
  {
    id: 'power', name: 'Alimentation', targetId: 'energy', visual: 'battery',
    roles: { explorer: 'Elle donne de l’énergie à la machine.', scientist: 'Elle fournit et distribue l’énergie électrique.', expert: 'Elle convertit et distribue l’énergie aux autres composants.' },
    installedFeedback: { explorer: 'Parfait ! L’énergie peut circuler.', scientist: 'L’alimentation rétablit la distribution électrique.', expert: 'Le circuit de conversion et de distribution est rétabli.' },
  },
];

export const componentTargets: ComponentTarget[] = [
  {
    id: 'persistent', marker: '◇',
    needs: { explorer: 'Garder les dessins et les fichiers, même machine éteinte.', scientist: 'Conserver les fichiers après l’arrêt.', expert: 'Cette information doit survivre à l’extinction de la machine.' },
  },
  {
    id: 'compute', marker: '✦',
    needs: { explorer: 'Faire les calculs et suivre les consignes.', scientist: 'Calculer et exécuter les instructions.', expert: 'Les instructions arrivent, mais aucun organe ne peut les traiter.' },
  },
  {
    id: 'energy', marker: 'ϟ',
    needs: { explorer: 'Donner de l’énergie à toutes les pièces.', scientist: 'Fournir et distribuer l’énergie.', expert: 'Les circuits sont corrects, mais aucune tension ne les alimente.' },
  },
  {
    id: 'temporary', marker: '○',
    needs: { explorer: 'Garder juste ce qui sert en ce moment.', scientist: 'Conserver temporairement les informations utilisées maintenant.', expert: 'Le travail en cours disparaît avant même la fin du calcul.' },
  },
];

export const componentRules = Object.fromEntries(componentDefinitions.map(({ id, targetId }) => [id, targetId]));
export const allComponentPlacements = { processor: 'compute', ram: 'temporary', storage: 'persistent', power: 'energy' };

export const componentInstructions: Record<Level, string> = {
  explorer: 'Touche une pièce, puis l’endroit qui porte le même petit symbole. Tu peux aussi la faire glisser.',
  scientist: 'Associe chaque composant à la fonction dont la machine a besoin. Touche puis dépose, ou fais glisser.',
  expert: 'Diagnostique chaque symptôme et installe le composant qui y répond. Le glissement et la sélection en deux temps sont disponibles.',
};

export function placementError(level: Level, itemId: string, targetId: string) {
  const item = componentDefinitions.find(({ id }) => id === itemId);
  const target = componentTargets.find(({ id }) => id === targetId);
  if (!item || !target) return 'Cette pièce ne réagit pas ici.';
  if (level === 'explorer') return `${item.name} : ${item.roles.explorer} Ici, la machine demande autre chose. Essaie encore !`;
  if (level === 'scientist') return `${item.name} ${item.roles.scientist.toLocaleLowerCase()} Cette zone doit plutôt ${target.needs.scientist.toLocaleLowerCase()}`;
  return `Incompatibilité : « ${target.needs.expert} » ne correspond pas au rôle de ${item.name.toLocaleLowerCase()}.`;
}

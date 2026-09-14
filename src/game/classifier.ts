export type Observation = {
  name: string;
  brightness: number;
  regularity: number;
  label?: 'signal' | 'parasite';
};

export const balancedTraining: Observation[] = [
  { name: 'Pulsar A', brightness: 8, regularity: 9, label: 'signal' },
  { name: 'Pulsar B', brightness: 7, regularity: 8, label: 'signal' },
  { name: 'Nuage A', brightness: 3, regularity: 2, label: 'parasite' },
  { name: 'Nuage B', brightness: 5, regularity: 3, label: 'parasite' },
];

export const biasedTraining: Observation[] = [
  { name: 'Signal unique', brightness: 8, regularity: 8, label: 'signal' },
  { name: 'Parasite 1', brightness: 6, regularity: 5, label: 'parasite' },
  { name: 'Parasite 2', brightness: 7, regularity: 6, label: 'parasite' },
  { name: 'Parasite 3', brightness: 8, regularity: 6, label: 'parasite' },
  { name: 'Parasite 4', brightness: 9, regularity: 7, label: 'parasite' },
];

export const clearObservation: Observation = { name: 'Écho régulier', brightness: 8, regularity: 8 };
export const ambiguousObservation: Observation = { name: 'Lueur inconnue', brightness: 8, regularity: 7 };

export function classify(observation: Observation, training: Observation[], neighbors = 3): 'signal' | 'parasite' {
  if (!training.length) throw new Error('Le jeu d’apprentissage ne peut pas être vide.');
  const ranked = training
    .filter((item): item is Observation & { label: 'signal' | 'parasite' } => Boolean(item.label))
    .map((item) => ({ item, distance: Math.hypot(item.brightness - observation.brightness, item.regularity - observation.regularity) }))
    .sort((a, b) => a.distance - b.distance || a.item.name.localeCompare(b.item.name));
  const selected = ranked.slice(0, Math.max(1, Math.min(neighbors, ranked.length)));
  const score = selected.reduce((total, { item }) => total + (item.label === 'signal' ? 1 : -1), 0);
  return score > 0 ? 'signal' : 'parasite';
}

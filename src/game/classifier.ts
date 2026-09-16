export type ObservationClass = 'signal' | 'parasite';
export type Observation = { id: string; name: string; brightness: number; regularity: number; label?: ObservationClass };
export type NeighborResult = { observation: Observation & { label: ObservationClass }; distance: number };
export type ClassificationResult = { predictedClass: ObservationClass; neighbors: NeighborResult[]; votes: Record<ObservationClass, number> };

export const balancedTraining: Observation[] = [
  { id: 'signal-a', name: 'Signal A', brightness: 8, regularity: 9, label: 'signal' },
  { id: 'signal-b', name: 'Signal B', brightness: 7, regularity: 8, label: 'signal' },
  { id: 'parasite-a', name: 'Parasite A', brightness: 3, regularity: 2, label: 'parasite' },
  { id: 'parasite-b', name: 'Parasite B', brightness: 5, regularity: 3, label: 'parasite' },
];
export const newObservations: Observation[] = [
  { id: 'o1', name: 'O1', brightness: 8, regularity: 8 },
  { id: 'o2', name: 'O2', brightness: 7, regularity: 7 },
  { id: 'o3', name: 'O3', brightness: 4, regularity: 2 },
  { id: 'o4', name: 'O4', brightness: 5, regularity: 4 },
];
export const biasedTraining: Observation[] = [
  { id: 'signal-unique', name: 'Signal unique', brightness: 8, regularity: 8, label: 'signal' },
  { id: 'parasite-1', name: 'Parasite 1', brightness: 6, regularity: 5, label: 'parasite' },
  { id: 'parasite-2', name: 'Parasite 2', brightness: 7, regularity: 6, label: 'parasite' },
  { id: 'parasite-3', name: 'Parasite 3', brightness: 8, regularity: 6, label: 'parasite' },
  { id: 'parasite-4', name: 'Parasite 4', brightness: 9, regularity: 7, label: 'parasite' },
];
export const clearObservation: Observation = { id: 'clear', name: 'Écho régulier', brightness: 8, regularity: 8 };
export const ambiguousObservation: Observation = { id: 'ambiguous', name: 'Lueur inconnue', brightness: 8, regularity: 7 };

export function distanceBetween(a: Observation, b: Observation): number {
  return Math.hypot(a.brightness - b.brightness, a.regularity - b.regularity);
}

export function classifyDetailed(observation: Observation, training: readonly Observation[], k = 3): ClassificationResult {
  // Ignore les exemples sans étiquette ; une égalité de votes revient à « parasite ».
  // L'identifiant départage les distances égales, sans dépendre de la locale du navigateur.
  const labeled = training.filter((item): item is Observation & { label: ObservationClass } => item.label === 'signal' || item.label === 'parasite');
  if (!labeled.length) throw new Error('Le jeu d’apprentissage doit contenir au moins un exemple étiqueté.');
  const neighbors = labeled.map((item) => ({ observation: item, distance: distanceBetween(item, observation) }))
    .sort((a, b) => a.distance - b.distance || (a.observation.id < b.observation.id ? -1 : a.observation.id > b.observation.id ? 1 : 0))
    .slice(0, Math.max(1, Math.min(Math.floor(k) || 1, labeled.length)));
  const votes = neighbors.reduce<Record<ObservationClass, number>>((count, neighbor) => {
    count[neighbor.observation.label] += 1;
    return count;
  }, { signal: 0, parasite: 0 });
  return { predictedClass: votes.signal > votes.parasite ? 'signal' : 'parasite', neighbors, votes };
}

export function classify(observation: Observation, training: readonly Observation[], k = 3): ObservationClass {
  return classifyDetailed(observation, training, k).predictedClass;
}

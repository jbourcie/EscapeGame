import type { Level } from '../data/missions';
import { missions } from '../data/missions';
import { balancedTraining, classify, newObservations, type ObservationClass } from './classifier';

export const STORAGE_KEY = 'abbadie-progress-v1';

export type AIMissionProgress = {
  phase: 1 | 2 | 3;
  consulted: string[];
  placements: Record<string, ObservationClass>;
  balancedDone: boolean;
  biasedDone: boolean;
};
export const initialAIMission = (): AIMissionProgress => ({ phase: 1, consulted: [], placements: {}, balancedDone: false, biasedDone: false });

export type Progress = {
  level: Level | null;
  started: string[];
  completed: string[];
  fragments: Record<string, string>;
  attempts: Record<string, number>;
  hints: Record<string, number>;
  digitalPlacements: Record<string, Record<string, string>>;
  programBlocks: string[];
  binaryBits: number[];
  aiSimulationDone: boolean;
  aiMission: AIMissionProgress;
};

export const initialProgress = (): Progress => ({
  level: null,
  started: [],
  completed: [],
  fragments: {},
  attempts: {},
  hints: {},
  digitalPlacements: {},
  programBlocks: [],
  binaryBits: [0, 0, 0, 0],
  aiSimulationDone: false,
  aiMission: initialAIMission(),
});

const knownIds = new Set(missions.map(({ id }) => id));

export function sanitizeProgress(value: unknown): Progress {
  const empty = initialProgress();
  if (!value || typeof value !== 'object') return empty;
  const raw = value as Partial<Progress>;
  const level = raw.level === 'explorer' || raw.level === 'scientist' || raw.level === 'expert' ? raw.level : null;
  const stringList = (candidate: unknown) => Array.isArray(candidate) ? candidate.filter((id): id is string => typeof id === 'string' && knownIds.has(id)) : [];
  const numberRecord = (candidate: unknown) => Object.fromEntries(
    Object.entries(candidate && typeof candidate === 'object' ? candidate : {})
      .filter(([id, count]) => knownIds.has(id) && typeof count === 'number' && count >= 0),
  );
  const fragments = Object.fromEntries(
    Object.entries(raw.fragments && typeof raw.fragments === 'object' ? raw.fragments : {})
      .filter(([id, fragment]) => knownIds.has(id) && typeof fragment === 'string'),
  );
  const digitalPlacements = Object.fromEntries(
    Object.entries(raw.digitalPlacements && typeof raw.digitalPlacements === 'object' ? raw.digitalPlacements : {})
      .filter(([id, placements]) => knownIds.has(id) && placements && typeof placements === 'object')
      .map(([id, placements]) => [id, Object.fromEntries(
        Object.entries(placements as Record<string, unknown>)
          .filter(([itemId, targetId]) => Boolean(itemId) && typeof targetId === 'string'),
      ) as Record<string, string>]),
  ) as Record<string, Record<string, string>>;
  const aiRaw = raw.aiMission && typeof raw.aiMission === 'object' ? raw.aiMission : initialAIMission();
  const exampleIds = new Set(balancedTraining.map((item) => item.id));
  const observationIds = new Set(newObservations.map((item) => item.id));
  const consulted = Array.isArray(aiRaw.consulted) ? [...new Set(aiRaw.consulted.filter((id): id is string => typeof id === 'string' && exampleIds.has(id)))] : [];
  const placements = Object.fromEntries(Object.entries(aiRaw.placements && typeof aiRaw.placements === 'object' ? aiRaw.placements : {})
    .filter(([id, label]) => observationIds.has(id) && newObservations.some((item) => item.id === id && classify(item, balancedTraining) === label))) as Record<string, ObservationClass>;
  const phase = aiRaw.phase === 3 && consulted.length === 4 && Object.keys(placements).length === 4 ? 3 : (aiRaw.phase === 2 || aiRaw.phase === 3) && consulted.length === 4 ? 2 : 1;
  return {
    level,
    started: [...new Set(stringList(raw.started))],
    completed: [...new Set(stringList(raw.completed))],
    fragments,
    attempts: numberRecord(raw.attempts),
    hints: numberRecord(raw.hints),
    digitalPlacements,
    programBlocks: Array.isArray(raw.programBlocks) ? raw.programBlocks.filter((id): id is string => typeof id === 'string') : [],
    binaryBits: Array.isArray(raw.binaryBits) && raw.binaryBits.length === 4
      ? raw.binaryBits.map((bit) => bit === 1 ? 1 : 0)
      : empty.binaryBits,
    aiSimulationDone: raw.aiSimulationDone === true,
    aiMission: { phase, consulted, placements, balancedDone: phase === 3 && aiRaw.balancedDone === true, biasedDone: phase === 3 && aiRaw.balancedDone === true && aiRaw.biasedDone === true },
  };
}

export function loadProgress(storage: Pick<Storage, 'getItem'> = localStorage): Progress {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    return saved ? sanitizeProgress(JSON.parse(saved)) : initialProgress();
  } catch {
    return initialProgress();
  }
}

export function saveProgress(progress: Progress, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(storage: Pick<Storage, 'removeItem'> = localStorage) {
  storage.removeItem(STORAGE_KEY);
}

export function startMission(progress: Progress, id: string): Progress {
  if (!knownIds.has(id) || progress.started.includes(id)) return progress;
  return { ...progress, started: [...progress.started, id] };
}

export function validateFragment(progress: Progress, id: string, answer: string): { correct: boolean; progress: Progress } {
  const mission = missions.find((item) => item.id === id);
  if (!mission) return { correct: false, progress };
  if (answer === mission.answer) {
    return {
      correct: true,
      progress: {
        ...progress,
        started: progress.started.includes(id) ? progress.started : [...progress.started, id],
        completed: progress.completed.includes(id) ? progress.completed : [...progress.completed, id],
        fragments: { ...progress.fragments, [id]: mission.answer },
      },
    };
  }
  const attempts = (progress.attempts[id] ?? 0) + 1;
  const automaticHints = attempts >= 3 ? 2 : attempts >= 2 ? 1 : 0;
  return {
    correct: false,
    progress: {
      ...progress,
      started: progress.started.includes(id) ? progress.started : [...progress.started, id],
      attempts: { ...progress.attempts, [id]: attempts },
      hints: { ...progress.hints, [id]: Math.max(progress.hints[id] ?? 0, automaticHints) },
    },
  };
}

export const isFinaleUnlocked = (progress: Progress) => missions.every(({ id }) => progress.completed.includes(id));

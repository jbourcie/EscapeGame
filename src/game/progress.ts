import type { Level } from '../data/missions';
import { missions } from '../data/missions';
import { balancedTraining, classify, newObservations, type ObservationClass } from './classifier';

export const STORAGE_KEY = 'abbadie-progress-v1';

export type AIMissionProgress = {
  version: 2;
  phase: 1 | 2 | 3 | 4;
  consulted: string[];
  demoStep: number;
  demoAnswerCorrect: boolean;
  placements: Record<string, ObservationClass>;
  reviewItemId: string | null;
  comparisonStep: number;
  helpCounts: [number, number, number, number];
  balancedDone: boolean;
  biasedDone: boolean;
};
export const initialAIMission = (): AIMissionProgress => ({ version: 2, phase: 1, consulted: [], demoStep: 0, demoAnswerCorrect: false, placements: {}, reviewItemId: null, comparisonStep: 0, helpCounts: [0, 0, 0, 0], balancedDone: false, biasedDone: false });

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
  const legacy = aiRaw.version !== 2;
  const requestedPhase = legacy ? aiRaw.phase === 3 ? 4 : aiRaw.phase === 2 ? 2 : 1 : aiRaw.phase;
  const demoStep = legacy ? 0 : Math.max(0, Math.min(6, Number.isInteger(aiRaw.demoStep) ? aiRaw.demoStep : 0));
  const demoAnswerCorrect = !legacy && demoStep === 6 && aiRaw.demoAnswerCorrect === true;
  const canLeaveExamples = consulted.includes('signal-a') && consulted.includes('parasite-a');
  const phase = !canLeaveExamples ? 1 : requestedPhase === 4 && Object.keys(placements).length === 4 && (legacy || demoAnswerCorrect) ? 4 : requestedPhase === 3 && demoAnswerCorrect ? 3 : (requestedPhase === 2 || requestedPhase === 3 || requestedPhase === 4) ? 2 : 1;
  const reviewItemId = !legacy && typeof aiRaw.reviewItemId === 'string' && placements[aiRaw.reviewItemId] ? aiRaw.reviewItemId : null;
  const comparisonStep = phase === 4 && !legacy ? Math.max(0, Math.min(3, Number.isInteger(aiRaw.comparisonStep) ? aiRaw.comparisonStep : 0)) : 0;
  const helpCounts = Array.isArray(aiRaw.helpCounts) && aiRaw.helpCounts.length === 4 ? aiRaw.helpCounts.map((count) => Number.isInteger(count) ? Math.max(0, Math.min(3, count)) : 0) as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number];
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
    aiMission: { version: 2, phase, consulted, demoStep, demoAnswerCorrect, placements, reviewItemId, comparisonStep, helpCounts, balancedDone: phase === 4 && comparisonStep >= 2, biasedDone: phase === 4 && comparisonStep >= 3 },
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

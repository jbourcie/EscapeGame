import type { Level } from '../data/missions';
import { missions } from '../data/missions';

export const STORAGE_KEY = 'abbadie-progress-v1';

export type Progress = {
  level: Level | null;
  started: string[];
  completed: string[];
  fragments: Record<string, string>;
  attempts: Record<string, number>;
  hints: Record<string, number>;
  digitalPlacements: Record<string, Record<string, string>>;
  programBlocks: string[];
  aiSimulationDone: boolean;
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
  aiSimulationDone: false,
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
  return {
    level,
    started: [...new Set(stringList(raw.started))],
    completed: [...new Set(stringList(raw.completed))],
    fragments,
    attempts: numberRecord(raw.attempts),
    hints: numberRecord(raw.hints),
    digitalPlacements,
    programBlocks: Array.isArray(raw.programBlocks) ? raw.programBlocks.filter((id): id is string => typeof id === 'string') : [],
    aiSimulationDone: raw.aiSimulationDone === true,
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

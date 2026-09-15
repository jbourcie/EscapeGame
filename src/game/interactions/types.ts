export type MissionEvent =
  | { type: 'select'; itemId: string }
  | { type: 'place'; itemId: string; targetId: string }
  | { type: 'reset' };

export interface MissionInputAdapter {
  reset(): void;
  subscribe(callback: (event: MissionEvent) => void): () => void;
}

export type PlacementMap = Record<string, string>;

export type PlacementFeedback = {
  kind: 'idle' | 'success' | 'error';
  message: string;
};

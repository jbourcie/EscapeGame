import type { Level } from '../../data/missions';
import type { Instruction, ProgramGrid, RobotState } from './engine';

export type ProgramBlock = { id: string; label: string; icon: string; instruction: Instruction };

export const programGrid: ProgramGrid = {
  rows: 5,
  columns: 5,
  obstacles: [[3, 2], [2, 2], [1, 3]],
  target: [0, 4],
  celestial: [[0, 2], [2, 4]],
};
export const initialRobot: RobotState = { row: 4, column: 0, direction: 'north' };
export const programBlocks: ProgramBlock[] = [
  { id: 'repeat-a', label: 'Répéter 4× avancer', icon: '⟳4', instruction: { kind: 'repeat', times: 4, instruction: { kind: 'advance' } } },
  { id: 'right', label: 'Tourner à droite', icon: '↱', instruction: { kind: 'right' } },
  { id: 'repeat-b', label: 'Répéter 4× avancer', icon: '⟳4', instruction: { kind: 'repeat', times: 4, instruction: { kind: 'advance' } } },
  { id: 'advance', label: 'Avancer', icon: '↑', instruction: { kind: 'advance' } },
  { id: 'left', label: 'Tourner à gauche', icon: '↰', instruction: { kind: 'left' } },
  { id: 'right-extra', label: 'Tourner à droite', icon: '↱', instruction: { kind: 'right' } },
];
export const solutionIds = ['repeat-a', 'right', 'repeat-b'];
export const explorerStart = ['right', 'repeat-b', 'repeat-a'];
export const availableIds: Record<Level, string[]> = {
  explorer: solutionIds,
  scientist: programBlocks.map(({ id }) => id),
  expert: programBlocks.map(({ id }) => id),
};
export const executionFeedback: Record<string, string> = {
  obstacle: 'L’automate exécute exactement tes instructions : il vient de rencontrer un obstacle.',
  outside: 'L’automate est sorti de la grille. Vérifie son orientation avant de le faire avancer.',
  incomplete: 'Le programme s’est terminé avant d’atteindre Orion.',
  'wrong-target': 'L’automate a rejoint une case céleste, mais pas la constellation d’Orion.',
  'loop-error': 'La boucle ne peut pas être exécutée. Vérifie son nombre de répétitions.',
};

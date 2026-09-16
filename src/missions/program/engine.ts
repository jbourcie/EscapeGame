export type Direction = 'north' | 'east' | 'south' | 'west';
export type RobotState = { row: number; column: number; direction: Direction };
export type BasicInstruction = { kind: 'advance' } | { kind: 'left' } | { kind: 'right' };
export type Instruction = BasicInstruction | { kind: 'repeat'; times: number; instruction: BasicInstruction };
export type ExecutionStatus = 'running' | 'success' | 'obstacle' | 'outside' | 'incomplete' | 'wrong-target' | 'loop-error';
export type ExecutionStep = { instructionIndex: number; state: RobotState; status: ExecutionStatus };
export type ProgramGrid = { rows: number; columns: number; obstacles: Array<[number, number]>; target: [number, number]; celestial: Array<[number, number]> };

const directions: Direction[] = ['north', 'east', 'south', 'west'];
const sameCell = (state: RobotState, cell: [number, number]) => state.row === cell[0] && state.column === cell[1];

export function executeProgram(grid: ProgramGrid, initial: RobotState, instructions: Instruction[]): ExecutionStep[] {
  let state = { ...initial };
  const trace: ExecutionStep[] = [];
  for (let index = 0; index < instructions.length; index += 1) {
    const instruction = instructions[index];
    if (instruction.kind === 'repeat' && (!Number.isInteger(instruction.times) || instruction.times < 1 || instruction.times > 8)) {
      return [...trace, { instructionIndex: index, state, status: 'loop-error' }];
    }
    const expanded = instruction.kind === 'repeat' ? Array.from({ length: instruction.times }, () => instruction.instruction) : [instruction];
    for (const current of expanded) {
      if (current.kind === 'left' || current.kind === 'right') {
        const offset = current.kind === 'right' ? 1 : 3;
        state = { ...state, direction: directions[(directions.indexOf(state.direction) + offset) % 4] };
      } else {
        const delta = { north: [-1, 0], east: [0, 1], south: [1, 0], west: [0, -1] }[state.direction];
        const next = { ...state, row: state.row + delta[0], column: state.column + delta[1] };
        if (next.row < 0 || next.row >= grid.rows || next.column < 0 || next.column >= grid.columns) {
          return [...trace, { instructionIndex: index, state: next, status: 'outside' }];
        }
        state = next;
        if (grid.obstacles.some((cell) => sameCell(state, cell))) return [...trace, { instructionIndex: index, state, status: 'obstacle' }];
      }
      if (sameCell(state, grid.target)) return [...trace, { instructionIndex: index, state, status: 'success' }];
      trace.push({ instructionIndex: index, state: { ...state }, status: 'running' });
    }
  }
  const status: ExecutionStatus = grid.celestial.some((cell) => sameCell(state, cell)) ? 'wrong-target' : 'incomplete';
  return [...trace, { instructionIndex: Math.max(0, instructions.length - 1), state, status }];
}

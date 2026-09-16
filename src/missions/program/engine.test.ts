import { describe, expect, it } from 'vitest';
import { executeProgram, type ProgramGrid, type RobotState } from './engine';
import { initialRobot, programGrid } from './data';
const open: ProgramGrid = { rows: 3, columns: 3, obstacles: [], target: [2,2], celestial: [[0,2]] };
const start = (direction: RobotState['direction']): RobotState => ({ row: 1, column: 1, direction });
describe('moteur Programme', () => {
  it.each([['north',0,1],['east',1,2],['south',2,1],['west',1,0]] as const)('avance vers %s', (direction,row,column) => expect(executeProgram(open,start(direction),[{kind:'advance'}]).at(-1)?.state).toMatchObject({row,column}));
  it('tourne à gauche et à droite', () => { expect(executeProgram(open,start('north'),[{kind:'left'}]).at(-1)?.state.direction).toBe('west'); expect(executeProgram(open,start('north'),[{kind:'right'}]).at(-1)?.state.direction).toBe('east'); });
  it('répète une instruction', () => expect(executeProgram(open,{row:2,column:0,direction:'north'},[{kind:'repeat',times:2,instruction:{kind:'advance'}}]).at(-1)?.state.row).toBe(0));
  it('détecte obstacle, sortie, programme incomplet et mauvaise case', () => { expect(executeProgram({...open,obstacles:[[0,1]]},start('north'),[{kind:'advance'}]).at(-1)?.status).toBe('obstacle'); expect(executeProgram(open,{row:0,column:0,direction:'north'},[{kind:'advance'}]).at(-1)?.status).toBe('outside'); expect(executeProgram(open,start('north'),[]).at(-1)?.status).toBe('incomplete'); expect(executeProgram(open,{row:1,column:2,direction:'north'},[{kind:'advance'}]).at(-1)?.status).toBe('wrong-target'); });
  it('arrive sur Orion avec la boucle', () => expect(executeProgram(programGrid,initialRobot,[{kind:'repeat',times:4,instruction:{kind:'advance'}},{kind:'right'},{kind:'repeat',times:4,instruction:{kind:'advance'}}]).at(-1)?.status).toBe('success'));
});

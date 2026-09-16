// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useState } from 'react';
import { getMission } from '../../data/missions';
import { initialProgress, type Progress } from '../../game/progress';
import { ProgramMission } from './ProgramMission';
afterEach(cleanup);
const mission=getMission('program')!;
function Harness({initial={...initialProgress(),level:'scientist' as const}}:{initial?:Progress}){const [progress,setProgress]=useState(initial);return <><ProgramMission mission={mission} progress={progress} onProgress={setProgress} onBack={()=>undefined}/><output data-testid="saved">{JSON.stringify(progress)}</output></>}
async function add(user:ReturnType<typeof userEvent.setup>,name:RegExp,position:number){const reserve=screen.getByRole('heading',{name:/Blocs disponibles/i}).closest('aside')!;await user.click(within(reserve).getAllByRole('button',{name})[0]);await user.click(screen.getByRole('button',{name:new RegExp(`Position ${position}, vide`,'i')}));}
describe('mission Programme',()=>{
  it('ordonne, persiste et révèle automatiquement 7',async()=>{const user=userEvent.setup();render(<Harness/>);await add(user,/Répéter 4× avancer/i,1);await add(user,/Tourner à droite/i,2);await add(user,/Répéter 4× avancer/i,3);expect(screen.getByTestId('saved').textContent).toContain('repeat-a');await user.click(screen.getByRole('button',{name:/Exécuter/i}));await waitFor(()=>expect(screen.getByText(/Fragment 2 enregistré automatiquement/i)).toBeTruthy());expect(screen.getByTestId('saved').textContent).toContain('"program":"7"');expect(screen.queryByRole('textbox')).toBeNull();});
  it('restaure puis remet localement le programme à zéro',async()=>{const user=userEvent.setup();render(<Harness initial={{...initialProgress(),level:'scientist',programBlocks:['repeat-a','right']}}/>);expect(screen.getByLabelText(/Position 1 : Répéter/i)).toBeTruthy();await user.click(screen.getByRole('button',{name:/Réinitialiser ce programme/i}));expect(screen.getByTestId('saved').textContent).toContain('"programBlocks":[]');});
});

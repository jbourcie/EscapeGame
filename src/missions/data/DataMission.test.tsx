// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useState } from 'react';
import { getMission } from '../../data/missions';
import { initialProgress, type Progress } from '../../game/progress';
import { DataMission } from './DataMission';
afterEach(cleanup); const mission=getMission('data')!;
function Harness({initial,level='scientist'}:{initial?:Progress;level?:'explorer'|'scientist'|'expert'}){const [progress,setProgress]=useState<Progress>(initial??{...initialProgress(),level});return <><DataMission mission={mission} progress={progress} onProgress={setProgress} onBack={()=>undefined}/><output data-testid="saved">{JSON.stringify(progress)}</output></>}
describe('mission Données',()=>{
  it('active et désactive un bit au clic',async()=>{const user=userEvent.setup();render(<Harness/>);const star=screen.getByRole('button',{name:/Poids 4, étoile éteinte/i});await user.click(star);expect(screen.getByRole('button',{name:/Poids 4, étoile allumée/i})).toBeTruthy();await user.click(screen.getByRole('button',{name:/Poids 4, étoile allumée/i}));expect(screen.getByRole('button',{name:/Poids 4, étoile éteinte/i})).toBeTruthy();});
  it('explique une configuration incorrecte et révèle des indices progressifs',async()=>{const user=userEvent.setup();render(<Harness/>);await user.click(screen.getByRole('button',{name:/Vérifier l’observation/i}));expect(screen.getByText(/2 positions sont incorrectes/i)).toBeTruthy();await user.click(screen.getByRole('button',{name:/Obtenir un indice/i}));expect(screen.getByText(/Lis les positions/i)).toBeTruthy();await user.click(screen.getByRole('button',{name:/Obtenir un indice/i}));expect(screen.getByText(/Seules les positions portant un 1/i)).toBeTruthy();});
  it('réussit avec 0101, persiste et enregistre automatiquement 5',async()=>{const user=userEvent.setup();render(<Harness/>);await user.click(screen.getByRole('button',{name:/Poids 4, étoile éteinte/i}));await user.click(screen.getByRole('button',{name:/Poids 1, étoile éteinte/i}));expect(screen.getByTestId('saved').textContent).toContain('"binaryBits":[0,1,0,1]');await user.click(screen.getByRole('button',{name:/Vérifier l’observation/i}));expect(screen.getByLabelText(/Fragment découvert : 5/i)).toBeTruthy();expect(screen.getByTestId('saved').textContent).toContain('"data":"5"');expect(screen.queryByRole('textbox')).toBeNull();});
  it('restaure puis remet localement les bits à zéro',async()=>{const user=userEvent.setup();render(<Harness initial={{...initialProgress(),level:'expert',binaryBits:[1,0,1,0]}}/>);expect(screen.getByRole('button',{name:/Poids 8, étoile allumée/i})).toBeTruthy();await user.click(screen.getByRole('button',{name:/Réinitialiser le pupitre/i}));expect(screen.getByTestId('saved').textContent).toContain('"binaryBits":[0,0,0,0]');});
  it('adapte la consigne aux trois niveaux',()=>{render(<Harness level="explorer"/>);expect(screen.getByLabelText(/Modèle : étoile éteinte/i)).toBeTruthy();cleanup();render(<Harness level="expert"/>);expect(screen.getByText(/Valeur observée : cinq unités/i)).toBeTruthy();});
});

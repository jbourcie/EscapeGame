import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Mission } from '../../data/missions';
import { validateFragment, type Progress } from '../../game/progress';
import { binaryToDecimal, binaryWeights, countIncorrectBits, targetBits } from './binary';

type Props = { mission: Mission; progress: Progress; onProgress: Dispatch<SetStateAction<Progress>>; onBack: () => void };
const removeKey = (record: Record<string, number>, key: string) => { const next={...record}; delete next[key]; return next; };

export function DataMission({ mission, progress, onProgress, onBack }: Props) {
  const level = progress.level ?? 'scientist';
  const completed = progress.completed.includes(mission.id);
  const [bits, setBits] = useState(() => completed ? Array.from(targetBits) : progress.binaryBits.length === 4 ? progress.binaryBits : [0,0,0,0]);
  const [feedback, setFeedback] = useState('Active les étoiles pour reproduire le message céleste.');
  const success = completed;
  const value = binaryToDecimal(bits);
  const hintCount = progress.hints.data ?? 0;
  const toggleBit = (index: number) => {
    if (success) return;
    const next=bits.map((bit,current)=>current===index?(bit===1?0:1):bit);
    setBits(next); onProgress((current)=>({...current,binaryBits:next}));
  };
  const verify = () => {
    const incorrect=countIncorrectBits(bits);
    if (incorrect===0) { setFeedback('Le signal binaire est décodé : 4 + 1 donne 5.'); onProgress((current)=>validateFragment(current,mission.id,mission.answer).progress); }
    else { setFeedback(`${incorrect} ${incorrect===1?'position est incorrecte':'positions sont incorrectes'}. Observe le modèle et les poids sans changer au hasard.`); onProgress((current)=>validateFragment(current,mission.id,'').progress); }
  };
  const reset = () => { const empty=[0,0,0,0]; setBits(empty); setFeedback('Pupitre remis à zéro.'); onProgress((current)=>({...current,binaryBits:empty,attempts:removeKey(current.attempts,'data'),hints:removeKey(current.hints,'data')})); };
  const instruction = level==='explorer' ? 'Reproduis les quatre étoiles : vide, pleine, vide, pleine.' : level==='expert' ? 'L’observation porte la valeur 5. Construis son mot binaire avec les poids disponibles.' : 'Reproduis le mot binaire 0101 avec les poids 8, 4, 2 et 1.';
  return <section className="data-mission panel panel--wide">
    <div className="component-mission__topline"><button className="back-link" onClick={onBack}>← Retour à la carte</button>{!success&&<button className="button button--quiet" onClick={reset}>↺ Réinitialiser le pupitre</button>}</div>
    <header className="digital-mission-header"><div><p className="eyebrow">Module 4 · Données</p><h1>{mission.title}</h1></div><p>{instruction}</p></header>
    <div className={`binary-console ${success?'is-complete':''}`}>
      <div className="binary-observation"><span>Observation céleste</span>{level==='explorer'?<div aria-label="Modèle : étoile éteinte, allumée, éteinte, allumée"><i>☆</i><i>★</i><i>☆</i><i>★</i></div>:level==='expert'?<strong>Valeur observée : cinq unités</strong>:<strong>Signal reçu : 0101</strong>}</div>
      <div className="binary-dials" role="group" aria-label="Quatre positions binaires">
        {binaryWeights.map((weight,index)=>{const active=bits[index]===1;return <button key={weight} className={`binary-dial ${active?'is-on':''}`} aria-pressed={active} aria-label={`Poids ${weight}, étoile ${active?'allumée, bit 1':'éteinte, bit 0'}`} onClick={()=>toggleBit(index)}><span className="binary-weight">Poids {weight}</span><b aria-hidden="true">{active?'★':'☆'}</b><span className="binary-bit">{active?'1':'0'}</span><small>{active?`${weight} compte dans la somme`:'position éteinte'}</small><i aria-hidden="true" /></button>})}
      </div>
      <div className="binary-calculation" aria-live="polite"><span>{level==='expert'&&!success?'Valeur construite':'Calcul en cours'}</span>{level==='expert'&&!success?<div className="binary-calculation__masked">Addition complète masquée avant validation</div>:<div>{bits.map((bit,index)=><span key={binaryWeights[index]} className={bit?'is-active':''}>{bit} × {binaryWeights[index]}</span>).reduce<React.ReactNode[]>((all,item,index)=>index?[...all,<b key={`plus-${index}`}>+</b>,item]:[item],[])}</div>}<strong>= {value}</strong></div>
      <div className="binary-gauge"><span>0</span><i style={{width:`${Math.max(4,value/15*100)}%`}}/><b aria-label={success?'Fragment découvert : 5':'Fragment encore masqué'}>{success?'5':'?'}</b><span>15</span></div>
    </div>
    <div className="binary-actions"><button className="button button--primary" disabled={success} onClick={verify}>✦ Vérifier l’observation</button></div>
    <div className="component-feedback component-feedback--idle" role="status" aria-live="polite"><span>i</span><p>{feedback}</p></div>
    {!success&&<div className="component-hints"><button className="button button--hint" onClick={()=>onProgress((current)=>({...current,hints:{...current.hints,data:Math.min(mission.hints[level].length,hintCount+1)}}))}>Obtenir un indice</button>{hintCount>0&&<ol>{mission.hints[level].slice(0,hintCount).map((hint,index)=><li key={hint}><b>Indice {index+1}</b>{hint}</li>)}</ol>}</div>}
    {success&&<div className="component-success"><span className="component-success__seal">5</span><div><p className="eyebrow">Fragment 4 enregistré automatiquement</p><h2>Le message céleste est décodé</h2><p>{mission.learning}{level==='expert'?' Le bit de poids fort est à gauche ; le bit de poids faible est à droite.':''}</p></div><button className="button button--primary" onClick={onBack}>Retourner à la carte →</button></div>}
  </section>;
}

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Mission } from '../../data/missions';
import { DraggableItem } from '../../game/interactions/DraggableItem';
import { validateFragment, type Progress } from '../../game/progress';
import { chainItemsForLevel, chainRoles, correctChain, type ChainRole } from './data';
import { testChain, type ChainPlacements } from './engine';
type Props={mission:Mission;progress:Progress;onProgress:Dispatch<SetStateAction<Progress>>;onBack:()=>void};
const toStored=(placements:ChainPlacements)=>Object.fromEntries(Object.entries(placements).map(([role,item])=>[item,role]));
const fromStored=(stored:Record<string,string>):ChainPlacements=>Object.fromEntries(Object.entries(stored).map(([item,role])=>[role,item]));
const removeKey=(record:Record<string,number>,key:string)=>{const next={...record};delete next[key];return next;};

export function EverywhereMission({mission,progress,onProgress,onBack}:Props){
  const level=progress.level??'scientist'; const items=useMemo(()=>chainItemsForLevel(level),[level]);
  const completed=progress.completed.includes(mission.id);
  const [placements,setPlacements]=useState<ChainPlacements>(()=>{const restored=fromStored(progress.digitalPlacements.everywhere??{});return completed&&Object.keys(restored).length===0?correctChain:restored;});
  const [selectedId,setSelectedId]=useState<string|null>(null); const [draggingId,setDraggingId]=useState<string|null>(null);
  const [stage,setStage]=useState('idle'); const [feedback,setFeedback]=useState('Construis une chaîne complète, puis teste le système.'); const stop=useRef(false);
  const success=completed; const hintCount=progress.hints.everywhere??0;
  const persist=(next:ChainPlacements)=>{setPlacements(next);onProgress((current)=>({...current,digitalPlacements:{...current.digitalPlacements,everywhere:toStored(next)}}));};
  const place=(itemId:string,targetId:string)=>{if(success)return;const role=targetId as ChainRole;if(!chainRoles.some(({id})=>id===role))return;const next={...placements};for(const [currentRole,currentItem] of Object.entries(next))if(currentItem===itemId)delete next[currentRole as ChainRole];next[role]=itemId;persist(next);setSelectedId(null);setDraggingId(null);setFeedback(`${items.find(({id})=>id===itemId)?.title} est placé dans ${chainRoles.find(({id})=>id===role)?.title}. Teste la chaîne quand tu es prêt.`);};
  const remove=(role:ChainRole)=>{const next={...placements};delete next[role];persist(next);setFeedback('Carte retirée. Choisis un autre élément dans la réserve.');};
  const reset=()=>{stop.current=true;setStage('idle');setFeedback('Laboratoire remis à zéro.');persist({});onProgress((current)=>({...current,digitalPlacements:{...current.digitalPlacements,everywhere:{}},attempts:removeKey(current.attempts,'everywhere'),hints:removeKey(current.hints,'everywhere')}));};
  async function run(){const result=testChain(placements);stop.current=false;for(const current of result.stages){setStage(current);await new Promise((resolve)=>window.setTimeout(resolve,import.meta.env.MODE==='test'?0:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?80:420));if(stop.current)return;}setFeedback(result.message);if(result.success)onProgress((current)=>validateFragment(current,mission.id,mission.answer).progress);else onProgress((current)=>validateFragment(current,mission.id,'').progress);}
  const used=new Set(Object.values(placements));
  return <section className="everywhere-mission panel panel--wide">
    <div className="component-mission__topline"><button className="back-link" onClick={onBack}>← Retour à la carte</button>{!success&&<button className="button button--quiet" onClick={reset}>↺ Réinitialiser le laboratoire</button>}</div>
    <header className="digital-mission-header"><div><p className="eyebrow">Module 5 · Informatique partout</p><h1>{mission.title}</h1></div><p>{level==='expert'?'La lampe doit s’allumer automatiquement lorsque l’obscurité tombe.':'Construis la chaîne qui observe, décide puis agit.'}</p></header>
    <div className={`castle-lab lab-stage--${stage} ${success?'is-success':''}`}>
      <aside className="chain-reserve"><h2>Objets du laboratoire</h2><p>Sélectionne une carte puis touche une zone, ou fais-la glisser.</p><div>{items.filter(({id})=>!used.has(id)).map((item)=><DraggableItem key={item.id} itemId={item.id} selected={selectedId===item.id} dragging={draggingId===item.id} locked={false} onSelect={(id)=>setSelectedId((current)=>current===id?null:id)} onDragStart={setDraggingId} onDragEnd={()=>setDraggingId(null)} onDrop={place}><span className="chain-card"><b>{item.icon}</b><span><strong>{item.title}</strong><small>{item.description}</small></span></span></DraggableItem>)}</div></aside>
      <div className="chain-machine">
        <div className="castle-sky" aria-hidden="true"><i/><span>☾</span><b className="castle-lamp">✦</b><em>9</em></div>
        <div className="chain-zones">{chainRoles.map((role,index)=>{const itemId=placements[role.id];const item=items.find(({id})=>id===itemId);const compatible=level==='explorer'&&selectedId?items.find(({id})=>id===selectedId)?.role===role.id:false;const activate=()=>selectedId&&place(selectedId,role.id);return <div key={role.id} className="chain-step"><div role="button" tabIndex={0} data-drop-target={role.id} className={`chain-zone ${selectedId?'is-ready':''} ${compatible?'is-compatible':''} ${item?'is-filled':''} ${stage===['measure','decide','light'][index]?'is-active':''}`} aria-label={`${role.title}, ${role.description}${item?`, contient ${item.title}`:''}`} onClick={activate} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}}}><span className="chain-zone__number">{index+1}</span><i>{role.icon}</i><b>{role.title}</b><em>{role.verb}</em><small>{role.description}</small>{item&&<span className="chain-installed"><strong>{item.icon} {item.title}</strong><button type="button" aria-label={`Retirer ${item.title}`} onClick={(event)=>{event.stopPropagation();remove(role.id);}}>× Retirer</button></span>}</div>{index<2&&<span className={`chain-flow ${stage==='data'||stage==='command'||success?'is-flowing':''}`} aria-hidden="true">→</span>}</div>})}</div>
        <button className="button button--primary chain-test" disabled={success} onClick={run}>▶ Tester le système</button>
      </div>
    </div>
    <div className="component-feedback component-feedback--idle" role="status" aria-live="polite"><span>i</span><p>{feedback}</p></div>
    {!success&&<div className="component-hints"><button className="button button--hint" onClick={()=>onProgress((current)=>({...current,hints:{...current.hints,everywhere:Math.min(mission.hints[level].length,hintCount+1)}}))}>Obtenir un indice</button>{hintCount>0&&<ol>{mission.hints[level].slice(0,hintCount).map((hint,index)=><li key={hint}><b>Indice {index+1}</b>{hint}</li>)}</ol>}</div>}
    {success&&<div className="component-success"><span className="component-success__seal">9</span><div><p className="eyebrow">Fragment 5 enregistré automatiquement</p><h2>La lampe révèle le cadran du château</h2><p>{mission.learning}{level==='expert'?' Cet ensemble autonome est un système embarqué.':''}</p></div><button className="button button--primary" onClick={onBack}>Retourner à la carte →</button></div>}
  </section>;
}

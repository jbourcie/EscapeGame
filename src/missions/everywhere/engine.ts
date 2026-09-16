import { chainItems, chainRoles, correctChain, type ChainRole } from './data';
export type ChainPlacements=Partial<Record<ChainRole,string>>;
export type ChainTest={success:boolean;stages:string[];message:string;problemRole?:ChainRole};
export function testChain(placements:ChainPlacements):ChainTest{
  for(const role of chainRoles.map(({id})=>id)){
    const itemId=placements[role];
    if(!itemId)return{success:false,stages:['night'],problemRole:role,message:`Il manque un élément dans la zone ${role==='sensor'?'Capteur':role==='program'?'Programme':'Action'}.`};
    if(itemId!==correctChain[role]){const item=chainItems.find(({id})=>id===itemId);return{success:false,stages:['night',role==='sensor'?'measure':role==='program'?'measure,data':'measure,data,decide'],problemRole:role,message:item?.explanation??'Cet élément ne convient pas à cette étape.'};}
  }
  return{success:true,stages:['night','measure','data','decide','command','light'],message:'La chaîne fonctionne : la lampe s’allume lorsque l’obscurité tombe.'};
}

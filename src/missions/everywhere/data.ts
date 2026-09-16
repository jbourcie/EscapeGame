import type { Level } from '../../data/missions';
export type ChainRole='sensor'|'program'|'action';
export type ChainItem={id:string;role:ChainRole|'decoy';title:string;description:string;icon:string;explanation:string;levels:Level[]};
export const chainItems:ChainItem[]=[
  {id:'light-sensor',role:'sensor',title:'Capteur de luminosité',description:'Mesure la quantité de lumière.',icon:'◉',explanation:'Il observe précisément la lumière ambiante.',levels:['explorer','scientist','expert']},
  {id:'dark-rule',role:'program',title:'Règle programmée',description:'Si la lumière est faible, allumer la lampe.',icon:'⌘',explanation:'Cette règle transforme une donnée en décision.',levels:['explorer','scientist','expert']},
  {id:'lamp',role:'action',title:'Lampe commandée',description:'S’allume lorsqu’elle reçoit une commande.',icon:'✦',explanation:'La lampe est l’actionneur du système.',levels:['explorer','scientist','expert']},
  {id:'thermometer',role:'sensor',title:'Thermomètre ancien',description:'Mesure la température.',icon:'♨',explanation:'Le thermomètre mesure la température, pas la lumière.',levels:['explorer','scientist','expert']},
  {id:'mirror',role:'decoy',title:'Miroir',description:'Réfléchit la lumière sans programme.',icon:'◇',explanation:'Le miroir réfléchit la lumière sans recevoir de commande.',levels:['explorer','scientist','expert']},
  {id:'cable',role:'decoy',title:'Câble électrique',description:'Transporte l’électricité.',icon:'⌁',explanation:'Le câble transporte de l’électricité, mais il ne prend pas de décision.',levels:['explorer','scientist','expert']},
  {id:'mechanical-button',role:'sensor',title:'Bouton mécanique',description:'Réagit seulement quand une personne appuie.',icon:'●',explanation:'Ce bouton reçoit une action humaine ; il ne mesure pas l’obscurité.',levels:['scientist','expert']},
  {id:'book',role:'decoy',title:'Livre',description:'Conserve des informations lisibles.',icon:'▤',explanation:'Le livre contient des informations, mais ne traite aucune donnée.',levels:['scientist','expert']},
  {id:'gear',role:'decoy',title:'Engrenage',description:'Transmet un mouvement mécanique.',icon:'⚙',explanation:'L’engrenage transmet un mouvement sans exécuter de programme.',levels:['scientist','expert']},
  {id:'temperature-rule',role:'program',title:'Règle de température',description:'Si la température baisse, chauffer.',icon:'≋',explanation:'Cette règle est programmable, mais elle ne répond pas au besoin de lumière.',levels:['expert']},
  {id:'bell',role:'action',title:'Sonnette commandée',description:'Sonne lorsqu’elle reçoit une commande.',icon:'♢',explanation:'La sonnette est un actionneur, mais elle n’éclaire pas la paroi.',levels:['expert']},
];
export const correctChain:Record<ChainRole,string>={sensor:'light-sensor',program:'dark-rule',action:'lamp'};
export const chainItemsForLevel=(level:Level)=>chainItems.filter((item)=>item.levels.includes(level));
export const chainRoles:{id:ChainRole;title:string;verb:string;description:string;icon:string}[]=[
  {id:'sensor',title:'Capteur',verb:'observe',description:'observe le monde',icon:'◉'},
  {id:'program',title:'Programme',verb:'décide',description:'décide selon une règle',icon:'⌘'},
  {id:'action',title:'Action',verb:'agit',description:'agit sur le monde',icon:'✦'},
];

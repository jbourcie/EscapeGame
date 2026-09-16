import { describe,expect,it } from 'vitest';
import { testChain } from './engine';
describe('validation de chaîne embarquée',()=>{
  it('signale une chaîne incomplète',()=>expect(testChain({sensor:'light-sensor'})).toMatchObject({success:false,problemRole:'program'}));
  it('explique une chaîne incorrecte',()=>expect(testChain({sensor:'thermometer',program:'dark-rule',action:'lamp'}).message).toMatch(/température, pas la lumière/i));
  it('produit toutes les étapes pour la chaîne correcte',()=>expect(testChain({sensor:'light-sensor',program:'dark-rule',action:'lamp'})).toEqual({success:true,stages:['night','measure','data','decide','command','light'],message:expect.stringMatching(/lampe s’allume/i)}));
});

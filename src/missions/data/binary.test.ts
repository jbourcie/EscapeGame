import { describe, expect, it } from 'vitest';
import { binaryToDecimal, countIncorrectBits } from './binary';
describe('conversion binaire',()=>{
  it.each([[[0,0,0,0],0],[[0,1,0,1],5],[[1,1,1,1],15]] as const)('convertit %j en %i',(bits,value)=>expect(binaryToDecimal(bits)).toBe(value));
  it('compte les positions incorrectes',()=>expect(countIncorrectBits([1,1,0,0])).toBe(2));
});

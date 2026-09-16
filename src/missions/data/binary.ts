export const binaryWeights = [8, 4, 2, 1] as const;
export const targetBits = [0, 1, 0, 1] as const;

export function binaryToDecimal(bits: readonly number[], weights: readonly number[] = binaryWeights) {
  return bits.reduce((sum, bit, index) => sum + (bit === 1 ? (weights[index] ?? 0) : 0), 0);
}

export function countIncorrectBits(bits: readonly number[], target: readonly number[] = targetBits) {
  return target.reduce((count, bit, index) => count + (bits[index] === bit ? 0 : 1), 0);
}

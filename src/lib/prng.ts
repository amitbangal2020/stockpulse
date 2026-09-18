/**
 * Deterministic PRNG.
 *
 * Client components are rendered on the server first, so any data generated
 * with Math.random() during render differs between the two and React throws a
 * hydration mismatch. Pages that need random-looking data on first paint seed
 * this instead, then shuffle once after mount.
 */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

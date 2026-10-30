/**
 * Seeded, serializable PRNG (mulberry32).
 *
 * All simulation randomness must flow through an instance of this class so
 * that (a) runs are reproducible from a seed and (b) the state can be saved
 * and resumed mid-run. The 32-bit state is stored in CompanyState.rngState.
 */
export class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x9e3779b9
  }

  /** Current PRNG state (persist this to resume an identical stream). */
  getState(): number {
    return this.state >>> 0
  }

  setState(state: number): void {
    this.state = state >>> 0 || 0x9e3779b9
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let t = this.state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /** Uniform float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** True with probability p (0..1). */
  chance(p: number): boolean {
    return this.next() < p
  }

  /** Alias for chance(p). */
  boolean(p = 0.5): boolean {
    return this.chance(p)
  }

  /** Alias for int(min, max). */
  integer(min: number, max: number): number {
    return this.int(min, max)
  }

  /** Alias for range(min, max). */
  float(min: number, max: number): number {
    return this.range(min, max)
  }

  /** Pick a uniform random element. */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }

  /** Pick an element by weight. Weights must be non-negative. */
  pickWeighted<T>(entries: readonly { item: T; weight: number }[]): T {
    let total = 0
    for (const e of entries) total += Math.max(0, e.weight)
    let roll = this.next() * total
    for (const e of entries) {
      roll -= Math.max(0, e.weight)
      if (roll <= 0) return e.item
    }
    return entries[entries.length - 1].item
  }

  /** Fisher-Yates shuffle (returns a new array). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  /** Standard-ish random pick of a few distinct items. */
  sample<T>(arr: readonly T[], count: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(count, arr.length))
  }
}

/** Derive a new child seed deterministically from a base seed + label. */
export function deriveSeed(base: number, label: string): number {
  let h = base >>> 0
  for (let i = 0; i < label.length; i++) {
    h = Math.imul(h ^ label.charCodeAt(i), 0x01000193) >>> 0
  }
  return h >>> 0
}

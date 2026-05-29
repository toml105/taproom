// Deterministic seeded RNG so every device generates the SAME sequence for a
// round (fair memory games, identical random delays for reflex games).
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0
}

/** Deterministically pick `count` distinct indices in [0, length) from a seed. */
export function pickIndices(seed: number, length: number, count: number): number[] {
  const rng = mulberry32(seed)
  const idx = Array.from({ length }, (_, i) => i)
  const n = Math.min(count, length)
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (length - i))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, n)
}

/** Seed-shuffle options and return the new index of the original answer. */
export function shuffleWithAnswer(seed: number, options: string[], answer: number) {
  const order = pickIndices(seed, options.length, options.length)
  return { options: order.map((o) => options[o]), answer: order.indexOf(answer) }
}

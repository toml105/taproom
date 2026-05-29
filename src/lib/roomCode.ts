// 4-char room codes from an unambiguous alphabet (no 0/O/1/I/L). 31^4 ≈ 923k
// combos: collisions are negligible for party-scale concurrency.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  const bytes = new Uint32Array(4)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < 4; i++) code += ALPHABET[bytes[i] % ALPHABET.length]
  return code
}

/** Clean user-typed input down to valid alphabet chars, max 4. */
export function normalizeRoomCode(raw: string): string {
  return [...raw.toUpperCase()].filter((c) => ALPHABET.includes(c)).join('').slice(0, 4)
}

export function isValidRoomCode(code: string): boolean {
  return code.length === 4 && [...code].every((c) => ALPHABET.includes(c))
}

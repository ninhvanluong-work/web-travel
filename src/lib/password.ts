// Ambiguous characters (0/O, 1/l/I) are left out so a password read aloud or copied by hand stays correct
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+?';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function randomIndex(max: number): number {
  // Rejection sampling avoids modulo bias
  const limit = Math.floor(0x100000000 / max) * max;
  let value: number;
  do {
    // Array.from: typed arrays cannot be destructured with the project's TS target
    [value] = Array.from(crypto.getRandomValues(new Uint32Array(1)));
  } while (value >= limit);
  return value % max;
}

/** Cryptographically random password with at least one lowercase, uppercase, digit and symbol. */
export function generateRandomPassword(length = 12): string {
  const required = [LOWER, UPPER, DIGITS, SYMBOLS].map((set) => set[randomIndex(set.length)]);
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => ALL[randomIndex(ALL.length)]);
  const chars = [...required, ...rest];
  // Fisher–Yates shuffle so the required characters are not always at the start
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

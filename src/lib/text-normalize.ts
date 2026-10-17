/**
 * Shared text normalization for user input (admin forms and search boxes).
 * Keep the raw value in the input; normalize only when submitting or sending to the API.
 */

export const SEARCH_KEYWORD_MAX_LENGTH = 100;

// C0 control chars except \t (09) and \n (0A), plus DEL. \r is handled separately.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// Zero-width space / joiners and BOM, often pasted from Word/web pages
const ZERO_WIDTH_RE = /[\u200B-\u200D\u2060\uFEFF]/g;
const LINE_BREAK_RE = /\r\n?/g;
// `\s` already covers NBSP and other Unicode spaces
const WHITESPACE_RE = /\s+/g;

/**
 * Multi-line text: NFC (so decomposed Vietnamese from macOS/iOS/PDF matches the DB),
 * strip control/zero-width chars, unify line breaks, trim both ends. Inner newlines are kept.
 */
export function normalizeText(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(LINE_BREAK_RE, '\n')
    .replace(CONTROL_CHARS_RE, '')
    .replace(ZERO_WIDTH_RE, '')
    .trim();
}

/** Single-line text (names, titles): `normalizeText` + collapse every whitespace run into one space. */
export function normalizeSingleLine(value: string | null | undefined): string {
  return normalizeText(value).replace(WHITESPACE_RE, ' ');
}

/**
 * Search keyword sent to the API. Returns `undefined` when nothing meaningful is left,
 * so whitespace-only input never reaches the backend.
 * NOTE: `%` and `_` are intentionally NOT escaped — the backend must fix its ILIKE escaping.
 */
export function normalizeSearchKeyword(
  value: string | null | undefined,
  maxLength: number = SEARCH_KEYWORD_MAX_LENGTH
): string | undefined {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return undefined;
  // Array.from keeps surrogate pairs (emoji) intact when cutting
  const chars = Array.from(normalized);
  const cut = chars.length > maxLength ? chars.slice(0, maxLength).join('').trim() : normalized;
  return cut || undefined;
}

/**
 * Email used as an account identifier. Sign-up stores lowercase and the backend compares
 * case-sensitively, so login / forgot-password / booking must send the same lowercase form.
 * In zod schemas the equivalent is `z.string().trim().toLowerCase()` (placed before `.email()`).
 */
export function normalizeEmail(value: string | null | undefined): string {
  return normalizeSingleLine(value).toLowerCase();
}

/** Case- and form-insensitive comparison key for client-side filtering. */
export function toSearchComparable(value: string | null | undefined): string {
  return normalizeSingleLine(value).toLocaleLowerCase('vi');
}

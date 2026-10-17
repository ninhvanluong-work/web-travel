import { z } from 'zod';

import { normalizeSingleLine, normalizeText } from '@/lib/text-normalize';

interface RequiredTextOptions {
  /** Minimum length after normalization (default 1) */
  min?: number;
  max?: number;
  /** Shown when empty / whitespace-only / shorter than `min` */
  message?: string;
  maxMessage?: string;
  /** Keep inner line breaks (textarea) instead of collapsing to one line */
  multiline?: boolean;
}

interface OptionalTextOptions {
  max?: number;
  maxMessage?: string;
  multiline?: boolean;
}

/**
 * Required text field: normalizes (trim, NFC, collapse spaces) BEFORE validating,
 * so "   " fails and "  Ha Long  " is submitted as "Ha Long".
 */
export function requiredText({ min = 1, max, message, maxMessage, multiline = false }: RequiredTextOptions = {}) {
  const normalize = multiline ? normalizeText : normalizeSingleLine;
  let inner = z.string().min(min, message);
  if (max !== undefined) inner = inner.max(max, maxMessage);
  return z.string().transform(normalize).pipe(inner);
}

/** Optional text field: normalized, `null`/`undefined` are preserved as-is. */
export function optionalText({ max, maxMessage, multiline = false }: OptionalTextOptions = {}) {
  const normalize = multiline ? normalizeText : normalizeSingleLine;
  let inner = z.string();
  if (max !== undefined) inner = inner.max(max, maxMessage);
  return z
    .string()
    .nullish()
    .transform((v) => (v == null ? v : normalize(v)))
    .pipe(inner.nullish());
}

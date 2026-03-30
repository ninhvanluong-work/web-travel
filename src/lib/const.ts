/**
 * Minimal silent MP3 (0.1s) encoded as base64 data URI.
 * Used to unlock iOS Safari's HTMLMediaElement audio session in a user gesture context,
 * so subsequent <video>.play() calls across Client-Side Navigation are granted without
 * requiring a second tap.
 */
export const VIDEO_SILENT_MP3 =
  'data:audio/mpeg;base64,SUQzBAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAA5TQVJBAAAAMF//tAxBQABkwBpUAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
};

export const isServer = typeof window === 'undefined';
